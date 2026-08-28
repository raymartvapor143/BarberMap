<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shop;
use App\Models\ShopLocation;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Invoice;
use App\Models\Reservation;
use App\Models\ShopPost;
use App\Models\Review;
use App\Models\ContentReport;
use App\Models\BillingSetting;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Admin Overview Dashboard & Platform KPIs
     */
    public function getDashboard(Request $request)
    {
        $totalShops = Shop::count();
        $activeShops = Shop::where('status', 'active')->count();
        $pendingShops = Shop::whereIn('status', ['pending_payment', 'under_review'])->count();
        $suspendedShops = Shop::where('status', 'suspended')->count();
        $expiredShops = Shop::where('status', 'expired')->count();

        $pendingPayments = Payment::where('status', 'pending')->count();
        $activeSubscriptions = Subscription::where('status', 'active')->where('expires_at', '>', now())->count();
        $expiringSubscriptions = Subscription::where('status', 'active')
            ->whereBetween('expires_at', [now(), now()->addDays(7)])
            ->count();

        $totalReservations = Reservation::count();
        $monthlyRevenue = Payment::where('status', 'approved')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        $pendingReports = ContentReport::where('status', 'pending')->count();

        $recentPayments = Payment::with(['shop', 'user'])->latest()->limit(5)->get();
        $recentShops = Shop::with(['user', 'location'])->latest()->limit(5)->get();
        $recentLogs = AdminActivityLog::with('admin')->latest()->limit(8)->get();

        return response()->json([
            'stats' => [
                'total_shops' => $totalShops,
                'active_shops' => $activeShops,
                'pending_shops' => $pendingShops,
                'suspended_shops' => $suspendedShops,
                'expired_shops' => $expiredShops,
                'pending_payments' => $pendingPayments,
                'active_subscriptions' => $activeSubscriptions,
                'expiring_subscriptions' => $expiringSubscriptions,
                'total_reservations' => $totalReservations,
                'monthly_revenue' => (float) $monthlyRevenue,
                'pending_reports' => $pendingReports,
            ],
            'recent_payments' => $recentPayments,
            'recent_shops' => $recentShops,
            'recent_logs' => $recentLogs,
        ]);
    }

    /**
     * Payment Verification Management
     */
    public function getPayments(Request $request)
    {
        $status = $request->query('status');

        $query = Payment::with(['shop.location', 'user', 'reviewer'])->latest();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        return response()->json([
            'payments' => $query->get(),
        ]);
    }

    public function verifyPayment(Request $request, int $id)
    {
        $admin = $request->user();
        $payment = Payment::with(['shop.user'])->findOrFail($id);

        $validated = $request->validate([
            'action' => 'required|string|in:approve,reject',
            'rejection_reason' => 'required_if:action,reject|nullable|string|max:500',
        ]);

        $oldValues = $payment->toArray();

        if ($validated['action'] === 'approve') {
            $payment->update([
                'status' => 'approved',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            $shop = $payment->shop;

            // 1. Activate / Extend subscription for 30 days
            $startsAt = now();
            $expiresAt = now()->addDays(30);

            $subscription = Subscription::create([
                'shop_id' => $shop->id,
                'status' => 'active',
                'price_paid' => $payment->amount,
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt,
            ]);

            // 2. Generate Unique Immutable Invoice
            $invoiceNumber = 'INV-' . date('Y') . '-' . str_pad((string) (Invoice::count() + 1), 6, '0', STR_PAD_LEFT);
            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'shop_id' => $shop->id,
                'user_id' => $payment->user_id,
                'payment_id' => $payment->id,
                'billing_period_start' => $startsAt,
                'billing_period_end' => $expiresAt,
                'amount' => $payment->amount,
                'currency' => 'PHP',
                'payment_method' => $payment->payment_method,
                'reference_number' => $payment->reference_number,
                'status' => 'PAID',
            ]);

            // 3. Mark shop as active and eligible for map display
            $shop->update(['status' => 'active']);

            // 4. Send notification to shop owner
            if ($shop->user) {
                $shop->user->notifications()->create([
                    'title' => 'Subscription Approved & Activated! 🚀',
                    'message' => "Your payment of ₱{$payment->amount} was approved! {$shop->name} is now LIVE on the public map. Invoice #{$invoiceNumber} has been generated.",
                    'type' => 'success',
                    'link' => '/owner/subscription',
                ]);
            }

            // 5. Audit Log
            AdminActivityLog::log(
                $admin->id,
                'Approved payment and activated subscription for shop ' . $shop->name,
                'Payment',
                $payment->id,
                $oldValues,
                $payment->toArray()
            );

            return response()->json([
                'message' => "Payment approved! Shop '{$shop->name}' is now ACTIVE on the public map.",
                'payment' => $payment,
                'invoice' => $invoice,
            ]);

        } else {
            // Rejection
            $payment->update([
                'status' => 'rejected',
                'rejection_reason' => $validated['rejection_reason'] ?? 'Payment details or receipt could not be verified.',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            $shop = $payment->shop;
            if ($shop->status !== 'active') {
                $shop->update(['status' => 'pending_payment']);
            }

            if ($shop->user) {
                $shop->user->notifications()->create([
                    'title' => 'Payment Verification Issue',
                    'message' => "Your payment submission was rejected: {$payment->rejection_reason}. Please re-submit your receipt in the subscription panel.",
                    'type' => 'danger',
                    'link' => '/owner/subscription',
                ]);
            }

            AdminActivityLog::log(
                $admin->id,
                'Rejected payment for shop ' . $shop->name . ': ' . $payment->rejection_reason,
                'Payment',
                $payment->id,
                $oldValues,
                $payment->toArray()
            );

            return response()->json([
                'message' => "Payment marked as rejected.",
                'payment' => $payment,
            ]);
        }
    }

    /**
     * Shop Management
     */
    public function getShops(Request $request)
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $query = Shop::with(['user', 'location', 'activeSubscription'])->latest();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
        }

        return response()->json(['shops' => $query->get()]);
    }

    public function updateShopStatus(Request $request, int $id)
    {
        $admin = $request->user();
        $shop = Shop::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:active,pending_payment,under_review,expired,suspended',
        ]);

        $old = $shop->toArray();
        $shop->update(['status' => $validated['status']]);

        AdminActivityLog::log(
            $admin->id,
            "Changed shop '{$shop->name}' status to {$validated['status']}",
            'Shop',
            $shop->id,
            $old,
            $shop->toArray()
        );

        return response()->json([
            'message' => "Shop status updated to {$validated['status']}",
            'shop' => $shop,
        ]);
    }

    /**
     * Map Location Moderation
     */
    public function getMapLocations(Request $request)
    {
        $locations = ShopLocation::with(['shop' => function ($q) {
            $q->with('activeSubscription');
        }])->get();

        return response()->json(['locations' => $locations]);
    }

    public function toggleMarkerVisibility(Request $request, int $id)
    {
        $admin = $request->user();
        $location = ShopLocation::with('shop')->findOrFail($id);

        $old = $location->toArray();
        $location->update(['is_marker_visible' => !$location->is_marker_visible]);

        AdminActivityLog::log(
            $admin->id,
            ($location->is_marker_visible ? 'Restored' : 'Hidden') . " map marker for shop '{$location->shop->name}'",
            'ShopLocation',
            $location->id,
            $old,
            $location->toArray()
        );

        return response()->json([
            'message' => 'Marker visibility updated.',
            'location' => $location,
        ]);
    }

    /**
     * User Management
     */
    public function getUsers(Request $request)
    {
        $role = $request->query('role');
        $query = User::with('shop')->latest();

        if ($role && $role !== 'all') {
            $query->where('role', $role);
        }

        return response()->json(['users' => $query->get()]);
    }

    public function updateUserStatus(Request $request, int $id)
    {
        $admin = $request->user();
        $user = User::findOrFail($id);

        if ($user->id === $admin->id) {
            return response()->json(['message' => 'You cannot disable your own account.'], 422);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:active,suspended,disabled',
            'role' => 'nullable|string|in:super_admin,admin,moderator,payment_admin,shop_owner,customer',
        ]);

        $old = $user->toArray();
        $user->update($validated);

        AdminActivityLog::log(
            $admin->id,
            "Updated user {$user->name} status to {$user->status}" . (isset($validated['role']) ? " (Role: {$user->role})" : ''),
            'User',
            $user->id,
            $old,
            $user->toArray()
        );

        return response()->json(['message' => 'User updated successfully.', 'user' => $user]);
    }

    /**
     * Moderation & Content Reports
     */
    public function getReports(Request $request)
    {
        $reports = ContentReport::with('resolver')->latest()->get();
        return response()->json(['reports' => $reports]);
    }

    public function resolveReport(Request $request, int $id)
    {
        $admin = $request->user();
        $report = ContentReport::findOrFail($id);

        $validated = $request->validate([
            'action' => 'required|string|in:dismiss,remove_content,warn_owner,suspend_shop',
        ]);

        $old = $report->toArray();

        if ($validated['action'] === 'remove_content') {
            if ($report->reportable_type === 'shop_post') {
                $post = ShopPost::find($report->reportable_id);
                if ($post) $post->update(['status' => 'removed']);
            } elseif ($report->reportable_type === 'review') {
                $review = Review::find($report->reportable_id);
                if ($review) $review->update(['is_hidden' => true]);
            }
        } elseif ($validated['action'] === 'suspend_shop') {
            if ($report->reportable_type === 'shop') {
                $shop = Shop::find($report->reportable_id);
                if ($shop) $shop->update(['status' => 'suspended']);
            }
        }

        $report->update([
            'status' => 'resolved',
            'resolved_by' => $admin->id,
            'resolved_at' => now(),
        ]);

        AdminActivityLog::log(
            $admin->id,
            "Resolved content report #{$report->id} with action: {$validated['action']}",
            'ContentReport',
            $report->id,
            $old,
            $report->toArray()
        );

        return response()->json(['message' => 'Report resolved.', 'report' => $report]);
    }

    /**
     * Dynamic Billing Settings (Admin Price, GCash, Maya Account Configuration)
     * Critical: Never hardcodes prices; future changes do NOT alter historical invoices.
     */
    public function getBillingSettings(Request $request)
    {
        return response()->json([
            'subscription_price' => (float) BillingSetting::get('subscription_price', 350.00),
            'currency' => 'PHP',
            'plan_name' => BillingSetting::get('plan_name', 'BarberMap Pro Monthly'),
            'gcash_enabled' => (bool) BillingSetting::get('gcash_enabled', true),
            'gcash_account_name' => BillingSetting::get('gcash_account_name', 'BarberMap Inc.'),
            'gcash_account_number' => BillingSetting::get('gcash_account_number', '0917-123-4567'),
            'maya_enabled' => (bool) BillingSetting::get('maya_enabled', true),
            'maya_account_name' => BillingSetting::get('maya_account_name', 'BarberMap Inc.'),
            'maya_account_number' => BillingSetting::get('maya_account_number', '0918-987-6543'),
        ]);
    }

    public function updateBillingSettings(Request $request)
    {
        $admin = $request->user();

        $validated = $request->validate([
            'subscription_price' => 'required|numeric|min:1',
            'plan_name' => 'required|string|max:100',
            'gcash_enabled' => 'required|boolean',
            'gcash_account_name' => 'required|string|max:100',
            'gcash_account_number' => 'required|string|max:50',
            'maya_enabled' => 'required|boolean',
            'maya_account_name' => 'required|string|max:100',
            'maya_account_number' => 'required|string|max:50',
        ]);

        $oldSettings = [
            'subscription_price' => BillingSetting::get('subscription_price'),
            'gcash_account_number' => BillingSetting::get('gcash_account_number'),
            'maya_account_number' => BillingSetting::get('maya_account_number'),
        ];

        BillingSetting::set('subscription_price', $validated['subscription_price'], 'number', 'Monthly subscription fee');
        BillingSetting::set('plan_name', $validated['plan_name'], 'string', 'Plan display name');
        BillingSetting::set('gcash_enabled', $validated['gcash_enabled'], 'boolean', 'GCash acceptance status');
        BillingSetting::set('gcash_account_name', $validated['gcash_account_name'], 'string', 'GCash beneficiary name');
        BillingSetting::set('gcash_account_number', $validated['gcash_account_number'], 'string', 'GCash account phone number');
        BillingSetting::set('maya_enabled', $validated['maya_enabled'], 'boolean', 'Maya acceptance status');
        BillingSetting::set('maya_account_name', $validated['maya_account_name'], 'string', 'Maya beneficiary name');
        BillingSetting::set('maya_account_number', $validated['maya_account_number'], 'string', 'Maya account phone number');

        AdminActivityLog::log(
            $admin->id,
            "Updated Billing & Payment Settings (New Monthly Price: ₱{$validated['subscription_price']})",
            'BillingSetting',
            null,
            $oldSettings,
            $validated
        );

        return response()->json([
            'message' => 'Billing & Payment settings updated successfully without modifying historical transaction records.',
            'settings' => $validated,
        ]);
    }

    /**
     * Admin Audit Logs
     */
    public function getActivityLogs(Request $request)
    {
        $logs = AdminActivityLog::with('admin')->latest()->paginate(50);
        return response()->json($logs);
    }

    /**
     * Platform Invoices
     */
    public function getInvoices(Request $request)
    {
        $invoices = Invoice::with(['shop', 'user', 'payment'])->latest()->get();
        return response()->json(['invoices' => $invoices]);
    }

    /**
     * Platform-wide Reservations inspection
     */
    public function getReservations(Request $request)
    {
        $reservations = Reservation::with(['shop', 'service'])->latest()->paginate(50);
        return response()->json($reservations);
    }
}
