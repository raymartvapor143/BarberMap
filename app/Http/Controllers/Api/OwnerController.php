<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\ShopService;
use App\Models\ShopHour;
use App\Models\ShopBreak;
use App\Models\ShopPhoto;
use App\Models\HaircutPortfolio;
use App\Models\ShopPost;
use App\Models\PostImage;
use App\Models\Reservation;
use App\Models\Review;
use App\Models\BillingSetting;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class OwnerController extends Controller
{
    private function getOwnerShop(Request $request): Shop
    {
        $user = $request->user();
        $shop = $user->shop;

        if (!$shop) {
            abort(404, 'No shop profile found for this owner account.');
        }

        return $shop;
    }

    /**
     * Owner Dashboard KPI overview
     */
    public function getDashboard(Request $request)
    {
        $shop = $this->getOwnerShop($request);
        $shop->load(['location', 'activeSubscription', 'subscriptions', 'hours', 'services']);

        $today = now()->toDateString();
        $totalReservations = $shop->reservations()->count();
        $upcomingReservations = $shop->reservations()
            ->where('reservation_date', '>=', $today)
            ->whereIn('status', ['pending', 'confirmed'])
            ->count();
        $todayReservations = $shop->reservations()
            ->where('reservation_date', $today)
            ->with('service')
            ->orderBy('start_time')
            ->get();

        $recentReservations = $shop->reservations()
            ->with('service')
            ->latest()
            ->limit(5)
            ->get();

        $recentReviews = $shop->reviews()
            ->latest()
            ->limit(5)
            ->get();

        $recentPosts = $shop->posts()
            ->with('images')
            ->latest()
            ->limit(3)
            ->get();

        // Calculate profile completion percentage & checklist (Total = 100 points)
        $checklist = [
            [
                'key' => 'name',
                'label' => 'Shop Name & Tagline',
                'points' => 10,
                'is_completed' => !empty($shop->name),
                'tab' => 'profile',
            ],
            [
                'key' => 'description',
                'label' => 'About / Shop Story',
                'points' => 10,
                'is_completed' => !empty($shop->description),
                'tab' => 'profile',
            ],
            [
                'key' => 'logo',
                'label' => 'Shop Logo Image',
                'points' => 10,
                'is_completed' => !empty($shop->logo_url),
                'tab' => 'profile',
            ],
            [
                'key' => 'cover',
                'label' => 'Cover Photo Banner',
                'points' => 10,
                'is_completed' => !empty($shop->cover_url),
                'tab' => 'profile',
            ],
            [
                'key' => 'location',
                'label' => 'Geographic Map Coordinates (Lat / Lng)',
                'points' => 15,
                'is_completed' => (bool) ($shop->location && $shop->location->latitude && $shop->location->longitude),
                'tab' => 'profile',
            ],
            [
                'key' => 'plus_code',
                'label' => 'Google Maps Plus Code (Navigation Pin)',
                'points' => 10,
                'is_completed' => (bool) ($shop->location && !empty($shop->location->plus_code)),
                'tab' => 'profile',
            ],
            [
                'key' => 'services',
                'label' => 'Services & Pricing Menu',
                'points' => 15,
                'is_completed' => $shop->services()->count() > 0,
                'tab' => 'services',
            ],
            [
                'key' => 'hours',
                'label' => 'Weekly Business Hours',
                'points' => 10,
                'is_completed' => $shop->hours()->count() > 0,
                'tab' => 'hours',
            ],
            [
                'key' => 'portfolio',
                'label' => 'Haircut Portfolio Photos',
                'points' => 10,
                'is_completed' => $shop->portfolio()->count() > 0,
                'tab' => 'portfolio',
            ],
        ];

        $completionScore = 0;
        foreach ($checklist as $item) {
            if ($item['is_completed']) {
                $completionScore += $item['points'];
            }
        }

        return response()->json([
            'shop' => $shop,
            'kpis' => [
                'total_reservations' => $totalReservations,
                'upcoming_reservations' => $upcomingReservations,
                'today_count' => $todayReservations->count(),
                'rating_avg' => (float) $shop->rating_avg,
                'reviews_count' => (int) $shop->reviews_count,
                'profile_completion' => min(100, $completionScore),
                'completion_checklist' => $checklist,
            ],
            'today_reservations' => $todayReservations,
            'recent_reservations' => $recentReservations,
            'recent_reviews' => $recentReviews,
            'recent_posts' => $recentPosts,
        ]);
    }

    /**
     * Shop Profile Read & Update
     */
    public function getProfile(Request $request)
    {
        $shop = $this->getOwnerShop($request);
        $shop->load('location');
        return response()->json(['shop' => $shop]);
    }

    public function updateProfile(Request $request)
    {
        $shop = $this->getOwnerShop($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:100',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'barangay' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'plus_code' => 'nullable|string|max:100',
            'logo' => 'nullable|file|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
            'cover' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:10240',
            'logo_url' => 'nullable|string|max:1000',
            'cover_url' => 'nullable|string|max:1000',
            'social_links' => 'nullable|array',
            'starting_price' => 'nullable|numeric|min:0',
        ]);

        if ($request->hasFile('logo')) {
            $logoFile = $request->file('logo');
            $logoName = 'logo_' . $shop->id . '_' . time() . '.' . $logoFile->getClientOriginalExtension();
            $logoFile->storeAs('shop_branding', $logoName, 'local');
            $validated['logo_url'] = '/api/public/media/shop_branding/' . $logoName;
        }

        if ($request->hasFile('cover')) {
            $coverFile = $request->file('cover');
            $coverName = 'cover_' . $shop->id . '_' . time() . '.' . $coverFile->getClientOriginalExtension();
            $coverFile->storeAs('shop_branding', $coverName, 'local');
            $validated['cover_url'] = '/api/public/media/shop_branding/' . $coverName;
        }

        // Handle direct coordinates or location updates from profile
        $lat = $validated['latitude'] ?? null;
        $lng = $validated['longitude'] ?? null;
        $plusCode = $validated['plus_code'] ?? null;

        if ($lat !== null && $lng !== null) {
            $shop->location()->updateOrCreate(
                ['shop_id' => $shop->id],
                [
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'plus_code' => $plusCode,
                    'formatted_address' => ($validated['address'] ?? $shop->address) . ', ' . ($validated['city'] ?? $shop->city),
                    'is_marker_visible' => true,
                ]
            );
        } elseif ($plusCode) {
            $shop->location()->updateOrCreate(
                ['shop_id' => $shop->id],
                [
                    'plus_code' => $plusCode,
                    'formatted_address' => ($validated['address'] ?? $shop->address) . ', ' . ($validated['city'] ?? $shop->city),
                ]
            );
        }

        unset($validated['logo'], $validated['cover'], $validated['latitude'], $validated['longitude'], $validated['plus_code']);

        $shop->update($validated);
        $shop->load('location');

        return response()->json([
            'message' => 'Shop profile & location updated successfully!',
            'shop' => $shop,
        ]);
    }

    /**
     * Update Location Pin & Address
     */
    public function updateLocation(Request $request)
    {
        $shop = $this->getOwnerShop($request);

        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'plus_code' => 'nullable|string|max:100',
            'formatted_address' => 'nullable|string|max:500',
            'is_marker_visible' => 'nullable|boolean',
        ]);

        $location = $shop->location()->updateOrCreate(
            ['shop_id' => $shop->id],
            $validated
        );

        return response()->json([
            'message' => 'Location coordinates saved successfully!',
            'location' => $location,
        ]);
    }

    /**
     * Services CRUD
     */
    public function getServices(Request $request)
    {
        $shop = $this->getOwnerShop($request);
        return response()->json(['services' => $shop->services()->orderBy('price')->get()]);
    }

    public function saveService(Request $request, ?int $id = null)
    {
        $shop = $this->getOwnerShop($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:15|max:300',
            'is_active' => 'boolean',
        ]);

        if ($id) {
            $service = $shop->services()->findOrFail($id);
            $service->update($validated);
            $message = 'Service updated successfully!';
        } else {
            $service = $shop->services()->create($validated);
            $message = 'Service added successfully!';
        }

        // Update starting price on shop
        $minPrice = $shop->services()->where('is_active', true)->min('price');
        if ($minPrice) {
            $shop->update(['starting_price' => $minPrice]);
        }

        return response()->json(['message' => $message, 'service' => $service]);
    }

    public function deleteService(Request $request, int $id)
    {
        $shop = $this->getOwnerShop($request);
        $service = $shop->services()->findOrFail($id);
        $service->delete();

        return response()->json(['message' => 'Service deleted.']);
    }

    /**
     * Business Hours & Breaks
     */
    public function getHours(Request $request)
    {
        $shop = $this->getOwnerShop($request);
        return response()->json([
            'hours' => $shop->hours()->orderBy('day_of_week')->get(),
            'breaks' => $shop->breaks()->get(),
        ]);
    }

    public function updateHours(Request $request)
    {
        $shop = $this->getOwnerShop($request);

        $validated = $request->validate([
            'hours' => 'present|array',
            'hours.*.day_of_week' => 'required|integer|between:0,6',
            'hours.*.open_time' => 'required|string',
            'hours.*.close_time' => 'required|string',
            'hours.*.is_closed' => 'required|boolean',
            'breaks' => 'nullable|array',
            'breaks.*.break_start' => 'required|string',
            'breaks.*.break_end' => 'required|string',
            'breaks.*.label' => 'nullable|string',
        ]);

        // Replace or sync hours
        $incomingDays = collect($validated['hours'])->pluck('day_of_week')->toArray();
        $shop->hours()->whereNotIn('day_of_week', $incomingDays)->delete();

        foreach ($validated['hours'] as $hData) {
            $shop->hours()->updateOrCreate(
                ['day_of_week' => $hData['day_of_week']],
                [
                    'open_time' => $hData['open_time'],
                    'close_time' => $hData['close_time'],
                    'is_closed' => $hData['is_closed'],
                ]
            );
        }

        if (isset($validated['breaks'])) {
            $shop->breaks()->delete();
            foreach ($validated['breaks'] as $bData) {
                $shop->breaks()->create($bData);
            }
        }

        return response()->json([
            'message' => 'Business hours updated successfully!',
            'hours' => $shop->hours()->orderBy('day_of_week')->get(),
        ]);
    }

    /**
     * Photos & Haircut Portfolio
     */
    public function getPhotosAndPortfolio(Request $request)
    {
        $shop = $this->getOwnerShop($request);
        return response()->json([
            'photos' => $shop->photos()->orderBy('sort_order')->get(),
            'portfolio' => $shop->portfolio()->latest()->get(),
        ]);
    }

    public function savePortfolioItem(Request $request, ?int $id = null)
    {
        $shop = $this->getOwnerShop($request);

        $validated = $request->validate([
            'image' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:10240',
            'url' => 'nullable|string|max:1000',
            'title' => 'nullable|string|max:255',
            'category' => 'required|string|in:Fade,Classic,Beard,Crop,Kids,Other',
            'tags' => 'nullable|array',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $imgName = 'port_' . $shop->id . '_' . time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
            $file->storeAs('shop_portfolio', $imgName, 'local');
            $validated['url'] = '/api/public/media/shop_portfolio/' . $imgName;
        }

        if (empty($validated['url'])) {
            return response()->json(['message' => 'Please attach a portfolio haircut photo.'], 422);
        }

        unset($validated['image']);

        if ($id) {
            $item = $shop->portfolio()->findOrFail($id);
            $item->update($validated);
            $msg = 'Portfolio photo updated.';
        } else {
            $item = $shop->portfolio()->create($validated);
            $msg = 'Portfolio photo added.';
        }

        return response()->json(['message' => $msg, 'item' => $item]);
    }

    public function deletePortfolioItem(Request $request, int $id)
    {
        $shop = $this->getOwnerShop($request);
        $shop->portfolio()->findOrFail($id)->delete();
        return response()->json(['message' => 'Portfolio item removed.']);
    }

    public function saveGalleryPhoto(Request $request)
    {
        $shop = $this->getOwnerShop($request);

        $validated = $request->validate([
            'url' => 'required|string|max:1000',
            'caption' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
        ]);

        $photo = $shop->photos()->create($validated);

        return response()->json(['message' => 'Gallery photo added.', 'photo' => $photo]);
    }

    public function deleteGalleryPhoto(Request $request, int $id)
    {
        $shop = $this->getOwnerShop($request);
        $shop->photos()->findOrFail($id)->delete();
        return response()->json(['message' => 'Photo removed.']);
    }

    /**
     * Posts / CMS
     */
    public function getPosts(Request $request)
    {
        $shop = $this->getOwnerShop($request);
        return response()->json([
            'posts' => $shop->posts()->with('images')->latest()->get(),
        ]);
    }

    public function savePost(Request $request, ?int $id = null)
    {
        $shop = $this->getOwnerShop($request);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'post_type' => 'required|string|in:Announcement,Promotion,Haircut,Update',
            'status' => 'required|string|in:draft,published,unpublished',
            'image' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:10240',
            'images' => 'nullable|array',
            'images.*' => 'string|max:1000',
        ]);

        $postData = [
            'title' => $validated['title'],
            'content' => $validated['content'],
            'post_type' => $validated['post_type'],
            'status' => $validated['status'],
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ];

        if ($id) {
            $post = $shop->posts()->findOrFail($id);
            $post->update($postData);
            $msg = 'Post updated successfully!';
        } else {
            $post = $shop->posts()->create($postData);
            $msg = 'Post created successfully!';
        }

        $imageUrls = $validated['images'] ?? [];

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $imgName = 'post_' . $shop->id . '_' . time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
            $file->storeAs('shop_posts', $imgName, 'local');
            $imageUrls[] = '/api/public/media/shop_posts/' . $imgName;
        }

        if (!empty($imageUrls)) {
            $post->images()->delete();
            foreach ($imageUrls as $idx => $imgUrl) {
                $post->images()->create([
                    'url' => $imgUrl,
                    'sort_order' => $idx,
                ]);
            }
        }

        $post->load('images');

        return response()->json(['message' => $msg, 'post' => $post]);
    }

    public function deletePost(Request $request, int $id)
    {
        $shop = $this->getOwnerShop($request);
        $shop->posts()->findOrFail($id)->delete();
        return response()->json(['message' => 'Post deleted.']);
    }

    /**
     * Reservations Management
     */
    public function getReservations(Request $request)
    {
        $shop = $this->getOwnerShop($request);
        $status = $request->query('status');

        $query = $shop->reservations()->with('service')->latest('reservation_date')->latest('start_time');

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        return response()->json([
            'reservations' => $query->get(),
        ]);
    }

    public function updateReservationStatus(Request $request, int $id)
    {
        $shop = $this->getOwnerShop($request);
        $reservation = $shop->reservations()->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,cancelled,completed,no-show',
        ]);

        $reservation->update(['status' => $validated['status']]);

        return response()->json([
            'message' => "Reservation status updated to {$validated['status']}.",
            'reservation' => $reservation,
        ]);
    }

    /**
     * Ratings & Reviews Reply
     */
    public function getReviews(Request $request)
    {
        $shop = $this->getOwnerShop($request);
        return response()->json([
            'reviews' => $shop->reviews()->latest()->get(),
            'rating_avg' => (float) $shop->rating_avg,
            'reviews_count' => (int) $shop->reviews_count,
        ]);
    }

    public function replyToReview(Request $request, int $id)
    {
        $shop = $this->getOwnerShop($request);
        $review = $shop->reviews()->findOrFail($id);

        $validated = $request->validate([
            'owner_reply' => 'required|string|max:1000',
        ]);

        $review->update([
            'owner_reply' => $validated['owner_reply'],
            'owner_replied_at' => now(),
        ]);

        return response()->json([
            'message' => 'Reply posted successfully.',
            'review' => $review,
        ]);
    }

    /**
     * Subscription & Payment Submission flow
     */
    public function getBillingOverview(Request $request)
    {
        $shop = $this->getOwnerShop($request);
        $user = $request->user();

        $activeSub = $shop->activeSubscription;
        $history = $shop->subscriptions()->with('plan')->latest()->get();
        $payments = $shop->payments()->latest()->get();
        $invoices = $shop->invoices()->latest()->get();

        $currentPrice = (float) BillingSetting::get('subscription_price', 350.00);

        return response()->json([
            'active_subscription' => $activeSub,
            'history' => $history,
            'payments' => $payments,
            'invoices' => $invoices,
            'payment_instructions' => [
                'monthly_price' => $currentPrice,
                'currency' => 'PHP',
                'gcash_account_name' => BillingSetting::get('gcash_account_name', 'BarberMap Admin'),
                'gcash_account_number' => BillingSetting::get('gcash_account_number', '0917-123-4567'),
                'gcash_enabled' => (bool) BillingSetting::get('gcash_enabled', true),
                'maya_account_name' => BillingSetting::get('maya_account_name', 'BarberMap Admin'),
                'maya_account_number' => BillingSetting::get('maya_account_number', '0918-987-6543'),
                'maya_enabled' => (bool) BillingSetting::get('maya_enabled', true),
            ],
            'shop_status' => $shop->status,
        ]);
    }

    public function submitPayment(Request $request)
    {
        $shop = $this->getOwnerShop($request);
        $user = $request->user();

        $currentPrice = (float) BillingSetting::get('subscription_price', 350.00);

        $validated = $request->validate([
            'payment_method' => 'required|string|in:GCash,Maya',
            'amount' => 'required|numeric|min:1',
            'reference_number' => 'required|string|max:100',
            'payment_date' => 'required|date',
            'receipt' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:10240',
            'receipt_url' => 'nullable|string|max:2000',
        ]);

        $receiptUrl = $validated['receipt_url'] ?? '';

        if ($request->hasFile('receipt')) {
            $file = $request->file('receipt');
            $filename = 'proof_' . $shop->id . '_' . time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            // Store directly in storage/app/private/payment_proof/
            $path = $file->storeAs('payment_proof', $filename, 'local');
            $receiptUrl = '/api/owner/billing/payment-proof/' . $filename;
        }

        if (empty($receiptUrl)) {
            return response()->json(['message' => 'Please upload a receipt image or screenshot.'], 422);
        }

        $payment = Payment::create([
            'shop_id' => $shop->id,
            'user_id' => $user->id,
            'payment_method' => $validated['payment_method'],
            'amount' => $validated['amount'],
            'reference_number' => $validated['reference_number'],
            'payment_date' => $validated['payment_date'],
            'receipt_url' => $receiptUrl,
            'status' => 'pending',
        ]);

        // Update shop status to under_review if not active
        if ($shop->status !== 'active') {
            $shop->update(['status' => 'under_review']);
        }

        // Send owner notification
        $user->notifications()->create([
            'title' => 'Payment Submitted for Verification',
            'message' => "Your payment of ₱{$validated['amount']} via {$validated['payment_method']} (Ref: {$validated['reference_number']}) was received and is pending admin verification.",
            'type' => 'info',
            'link' => '/owner/subscription',
        ]);

        return response()->json([
            'message' => 'Payment submitted successfully! An administrator will review and verify your receipt shortly.',
            'payment' => $payment,
        ], 201);
    }

    /**
     * Securely serve payment proof images from private storage
     */
    public function viewPaymentProof(Request $request, string $filename)
    {
        $user = $request->user();
        $path = 'payment_proof/' . basename($filename);

        if (!Storage::disk('local')->exists($path)) {
            abort(404, 'Receipt image not found.');
        }

        $fullPath = Storage::disk('local')->path($path);

        // Only allow shop owner or admins to view payment receipts
        return response()->file($fullPath);
    }
}
