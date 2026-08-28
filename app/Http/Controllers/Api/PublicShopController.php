<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\Review;
use App\Models\ContentReport;
use App\Models\Reservation;
use App\Models\BillingSetting;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class PublicShopController extends Controller
{
    /**
     * Map Discovery Endpoint
     * Strict Rule: Only shops with active status, visible location marker, and active unexpired subscription appear.
     */
    public function getMapShops(Request $request)
    {
        $search = $request->query('search');
        $city = $request->query('city');
        $category = $request->query('category');

        $query = Shop::with([
            'location',
            'services' => function ($q) {
                $q->where('is_active', true)->orderBy('price');
            },
            'hours',
            'activeSubscription'
        ])
            ->where('status', 'active')
            ->whereHas('location', function ($q) {
                $q->where('is_marker_visible', true);
            })
            ->whereHas('subscriptions', function ($q) {
                $q->where('status', 'active')
                    ->where('expires_at', '>', now());
            });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('tagline', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('barangay', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($city && $city !== 'all') {
            $query->where('city', $city);
        }

        $shops = $query->get()->map(function ($shop) {
            return [
                'id' => $shop->id,
                'name' => $shop->name,
                'slug' => $shop->slug,
                'tagline' => $shop->tagline,
                'description' => $shop->description,
                'address' => $shop->address,
                'city' => $shop->city,
                'barangay' => $shop->barangay,
                'logo_url' => $shop->logo_url,
                'cover_url' => $shop->cover_url,
                'rating_avg' => (float) $shop->rating_avg,
                'reviews_count' => (int) $shop->reviews_count,
                'starting_price' => (float) $shop->starting_price,
                'phone' => $shop->phone,
                'location' => [
                    'latitude' => (float) $shop->location->latitude,
                    'longitude' => (float) $shop->location->longitude,
                    'formatted_address' => $shop->location->formatted_address,
                ],
                'services_count' => $shop->services->count(),
                'starting_service' => $shop->services->first(),
                'hours' => $shop->hours,
            ];
        });

        // Extract unique active verified cities
        $availableCities = Shop::where('status', 'active')
            ->whereNotNull('city')
            ->where('city', '!=', '')
            ->whereHas('location', function ($q) {
                $q->where('is_marker_visible', true);
            })
            ->whereHas('subscriptions', function ($q) {
                $q->where('status', 'active')
                    ->where('expires_at', '>', now());
            })
            ->distinct()
            ->pluck('city')
            ->values();

        return response()->json([
            'count' => $shops->count(),
            'shops' => $shops,
            'available_cities' => $availableCities,
        ]);
    }

    /**
     * Public Shop Landing Page Mini-site
     */
    public function getShopBySlug(Request $request, string $slug)
    {
        $shop = Shop::with([
            'location',
            'services' => function ($q) {
                $q->where('is_active', true)->orderBy('price');
            },
            'hours' => function ($q) {
                $q->orderBy('day_of_week');
            },
            'breaks',
            'photos' => function ($q) {
                $q->orderBy('sort_order');
            },
            'portfolio',
            'posts' => function ($q) {
                $q->where('status', 'published')->with('images')->latest();
            },
            'reviews' => function ($q) {
                $q->where('is_hidden', false)->latest();
            },
            'activeSubscription',
        ])
            ->where('slug', $slug)
            ->firstOrFail();

        // Check if shop is active and has valid subscription (unless previewing as owner/admin)
        $user = $request->user();
        $isOwnerOrAdmin = $user && ($user->id === $shop->user_id || in_array($user->role, ['super_admin', 'admin', 'moderator']));

        $isPublicLive = $shop->isPubliclyVisible();

        // If the shop is not active / disabled and requester is not the shop owner or admin, block access
        if (!$isPublicLive && !$isOwnerOrAdmin) {
            return response()->json([
                'message' => 'This barber shop is currently unavailable, pending verification, or disabled.',
                'is_live' => false,
            ], 403);
        }

        return response()->json([
            'shop' => $shop,
            'is_live' => $isPublicLive,
            'preview_mode' => !$isPublicLive && $isOwnerOrAdmin,
        ]);
    }

    /**
     * Submit a customer review
     */
    public function submitReview(Request $request, int $shopId)
    {
        $shop = Shop::findOrFail($shopId);

        $validated = $request->validate([
            'customer_name' => 'required|string|max:100',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        $review = $shop->reviews()->create($validated);

        // Recalculate average rating & reviews count
        $avg = $shop->reviews()->where('is_hidden', false)->avg('rating') ?: 5.00;
        $count = $shop->reviews()->where('is_hidden', false)->count();

        $shop->update([
            'rating_avg' => round($avg, 2),
            'reviews_count' => $count,
        ]);

        // Notify shop owner
        if ($shop->user) {
            $shop->user->notifications()->create([
                'title' => 'New Review Received',
                'message' => "{$validated['customer_name']} left a {$validated['rating']}-star review for {$shop->name}.",
                'type' => 'info',
                'link' => '/owner/reviews',
            ]);
        }

        return response()->json([
            'message' => 'Review submitted successfully!',
            'review' => $review,
            'rating_avg' => $shop->rating_avg,
            'reviews_count' => $shop->reviews_count,
        ]);
    }

    /**
     * Report content / review
     */
    public function reportContent(Request $request)
    {
        $validated = $request->validate([
            'reportable_type' => 'required|string|in:shop_post,review,shop',
            'reportable_id' => 'required|integer',
            'reporter_name' => 'nullable|string|max:100',
            'reporter_email' => 'nullable|email',
            'reason' => 'required|string|max:1000',
        ]);

        $report = ContentReport::create($validated);

        return response()->json([
            'message' => 'Report submitted to moderators for review.',
            'report' => $report,
        ]);
    }

    /**
     * Get platform public settings (GCash/Maya payment instructions for display if needed)
     */
    public function getPublicSettings()
    {
        return response()->json([
            'monthly_price' => (float) BillingSetting::get('subscription_price', 350.00),
            'currency' => 'PHP',
            'gcash_account_name' => BillingSetting::get('gcash_account_name', 'BarberMap Admin'),
            'gcash_account_number' => BillingSetting::get('gcash_account_number', '0917-123-4567'),
            'gcash_enabled' => (bool) BillingSetting::get('gcash_enabled', true),
            'maya_account_name' => BillingSetting::get('maya_account_name', 'BarberMap Admin'),
            'maya_account_number' => BillingSetting::get('maya_account_number', '0918-987-6543'),
            'maya_enabled' => (bool) BillingSetting::get('maya_enabled', true),
        ]);
    }

    /**
     * Fetch exact invoice data by invoice number with relations
     */
    public function getInvoiceByNumber(string $number)
    {
        $invoice = Invoice::with(['shop.location', 'user', 'payment'])
            ->where('invoice_number', $number)
            ->first();

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found.'], 404);
        }

        return response()->json([
            'invoice' => $invoice
        ]);
    }

    /**
     * Serve shop branding images (logo, cover) stored in private storage
     */
    public function getMedia(string $folder, string $filename)
    {
        $safeFolders = ['shop_branding', 'shop_photos', 'shop_portfolio', 'shop_posts', 'payment_proof'];
        if (!in_array($folder, $safeFolders)) {
            abort(403, 'Unauthorized media directory.');
        }

        $path = $folder . '/' . basename($filename);

        if (!Storage::disk('local')->exists($path)) {
            abort(404, 'Image not found.');
        }

        $fullPath = Storage::disk('local')->path($path);

        return response()->file($fullPath, [
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
