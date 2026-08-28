<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Shop;
use App\Models\ShopLocation;
use App\Models\ShopService;
use App\Models\ShopHour;
use App\Models\ShopBreak;
use App\Models\ShopPhoto;
use App\Models\HaircutPortfolio;
use App\Models\ShopPost;
use App\Models\PostImage;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Reservation;
use App\Models\Review;
use App\Models\BillingSetting;
use App\Models\AdminActivityLog;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Dynamic Billing Settings
        // BillingSetting::set('subscription_price', 350.00, 'number', 'Monthly subscription fee in PHP');
        // BillingSetting::set('plan_name', 'BarberMap Pro Monthly', 'string', 'Plan name displayed to owners');
        // BillingSetting::set('gcash_enabled', true, 'boolean', 'GCash acceptance status');
        // BillingSetting::set('gcash_account_name', 'BarberMap Philippines Inc.', 'string', 'GCash official merchant name');
        // BillingSetting::set('gcash_account_number', '0917-888-2272', 'string', 'GCash receiving mobile number');
        // BillingSetting::set('maya_enabled', true, 'boolean', 'Maya acceptance status');
        // BillingSetting::set('maya_account_name', 'BarberMap Philippines Inc.', 'string', 'Maya official account name');
        // BillingSetting::set('maya_account_number', '0918-999-3383', 'string', 'Maya receiving mobile number');

        // 2. Seed Default Subscription Plan
        // $plan = SubscriptionPlan::create([
        //     'name' => 'BarberMap Monthly Pro Listing',
        //     'price' => 350.00,
        //     'currency' => 'PHP',
        //     'interval' => 'monthly',
        //     'is_active' => true,
        // ]);

        // 3. Admin User
        $admin = User::create([
            'name' => 'Super Administrator',
            'email' => 'admin@barbermap.com',
            'password' => Hash::make('password123'),
            'phone' => '09171112222',
            'role' => 'super_admin',
            'status' => 'active',
        ]);

        // 4. Shop Owner (Active with Live Subscription)
        // $owner1 = User::create([
        //     'name' => 'Juan Dela Cruz',
        //     'email' => 'owner@barbermap.com',
        //     'password' => Hash::make('password123'),
        //     'phone' => '09173334444',
        //     'role' => 'shop_owner',
        //     'status' => 'active',
        // ]);

        // Shop 1: Fresh Fade Barbershop (Active, Metro Manila - BGC Taguig)
        // $shop1 = Shop::create([
        //     'user_id' => $owner1->id,
        //     'name' => 'Fresh Fade Barbershop',
        //     'slug' => 'fresh-fade-barbershop',
        //     'tagline' => 'Crafting Confidence, One Cut at a Time',
        //     'description' => 'Established in 2021 in the heart of Bonifacio Global City, Fresh Fade Barbershop merges classic old-school craftsmanship with modern taper fade and styling mastery. Our master barbers specialize in razor-sharp fades, beard sculpting, and hot towel pampering treatments.',
        //     'phone' => '09173334444',
        //     'email' => 'contact@freshfadebarbers.ph',
        //     'address' => '26th Street cor. 7th Avenue, Bonifacio Global City',
        //     'city' => 'Taguig',
        //     'barangay' => 'Fort Bonifacio',
        //     'logo_url' => 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80',
        //     'cover_url' => 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=80',
        //     'social_links' => [
        //         'facebook' => 'https://facebook.com/freshfadebgc',
        //         'instagram' => 'https://instagram.com/freshfadebgc',
        //         'tiktok' => 'https://tiktok.com/@freshfadebgc',
        //     ],
        //     'status' => 'active',
        //     'rating_avg' => 4.90,
        //     'reviews_count' => 48,
        //     'starting_price' => 180.00,
        // ]);

        // $shop1->location()->create([
        //     'latitude' => 14.5503,
        //     'longitude' => 121.0504,
        //     'formatted_address' => '26th Street cor. 7th Avenue, BGC, Taguig, Metro Manila',
        //     'is_marker_visible' => true,
        // ]);

        // Active Subscription for Shop 1
        // $sub1 = Subscription::create([
        //     'shop_id' => $shop1->id,
        //     'plan_id' => $plan->id,
        //     'status' => 'active',
        //     'price_paid' => 350.00,
        //     'starts_at' => now()->subDays(5),
        //     'expires_at' => now()->addDays(25),
        // ]);

        // $pay1 = Payment::create([
        //     'shop_id' => $shop1->id,
        //     'user_id' => $owner1->id,
        //     'payment_method' => 'GCash',
        //     'amount' => 350.00,
        //     'reference_number' => 'GC-9928174620',
        //     'receipt_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        //     'payment_date' => now()->subDays(5)->toDateString(),
        //     'status' => 'approved',
        //     'reviewed_by' => $admin->id,
        //     'reviewed_at' => now()->subDays(5),
        // ]);

        // Invoice::create([
        //     'invoice_number' => 'INV-2026-000001',
        //     'shop_id' => $shop1->id,
        //     'user_id' => $owner1->id,
        //     'payment_id' => $pay1->id,
        //     'billing_period_start' => now()->subDays(5),
        //     'billing_period_end' => now()->addDays(25),
        //     'amount' => 350.00,
        //     'currency' => 'PHP',
        //     'payment_method' => 'GCash',
        //     'reference_number' => 'GC-9928174620',
        //     'status' => 'PAID',
        // ]);

        // Services for Shop 1
        // $shop1->services()->createMany([
        //     ['name' => 'Signature Skin Fade', 'description' => 'Precision zero/foil fade, scissor work on top, straight razor neck clean, pomade style.', 'price' => 250.00, 'duration_minutes' => 45, 'is_active' => true],
        //     ['name' => 'Classic Executive Haircut', 'description' => 'Scissor cut or classic side part taper with eucalyptus hot towel wrap.', 'price' => 180.00, 'duration_minutes' => 40, 'is_active' => true],
        //     ['name' => 'The Complete Gentleman (Hair + Beard)', 'description' => 'Signature fade, hot lather beard shape-up, oil conditioning and head massage.', 'price' => 380.00, 'duration_minutes' => 60, 'is_active' => true],
        //     ['name' => 'Royal Hot Towel Shave', 'description' => 'Triple hot towel prep, pre-shave oil, straight razor shave, and cooling aloe splash.', 'price' => 220.00, 'duration_minutes' => 35, 'is_active' => true],
        //     ['name' => 'Junior Dapper Cut (Kids under 12)', 'description' => 'Gentle and patient kids haircut with fun styling.', 'price' => 150.00, 'duration_minutes' => 30, 'is_active' => true],
        // ]);

        // Hours for Shop 1
        // for ($d = 0; $d <= 6; $d++) {
        //     $shop1->hours()->create([
        //         'day_of_week' => $d,
        //         'open_time' => '09:00:00',
        //         'close_time' => '21:00:00',
        //         'is_closed' => false,
        //     ]);
        // }
        // $shop1->breaks()->create([
        //     'break_start' => '13:00:00',
        //     'break_end' => '14:00:00',
        //     'label' => 'Afternoon Sanitation & Break',
        // ]);

        // Portfolio for Shop 1
        // $shop1->portfolio()->createMany([
        //     ['url' => 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80', 'title' => 'Low Drop Skin Fade', 'category' => 'Fade', 'tags' => ['fade', 'taper', 'texture']],
        //     ['url' => 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=600&q=80', 'title' => 'Executive Side Part Pompadour', 'category' => 'Classic', 'tags' => ['classic', 'vintage', 'pompadour']],
        //     ['url' => 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80', 'title' => 'Sharp Razor Beard Sculpt', 'category' => 'Beard', 'tags' => ['beard', 'lineup', 'grooming']],
        //     ['url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 'title' => 'French Textured Crop', 'category' => 'Crop', 'tags' => ['crop', 'fringe', 'modern']],
        //     ['url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'title' => 'Mid Burst Fade with Waves', 'category' => 'Fade', 'tags' => ['burst', 'waves', 'design']],
        // ]);

        // Photos for Shop 1
        // $shop1->photos()->createMany([
        //     ['url' => 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', 'caption' => 'Our Vintage Leather Barber Stations', 'sort_order' => 0, 'is_featured' => true],
        //     ['url' => 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=800&q=80', 'caption' => 'Customer Waiting Lounge & Espresso Bar', 'sort_order' => 1, 'is_featured' => false],
        //     ['url' => 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80', 'caption' => 'Sterilized Japanese Steel Scissors & Clippers', 'sort_order' => 2, 'is_featured' => false],
        // ]);

        // Posts / CMS for Shop 1
        // $post1 = $shop1->posts()->create([
        //     'title' => '💈 Weekend Promo: Free Hot Towel Treatment with every Skin Fade!',
        //     'content' => 'Upgrade your weekend game! Book any signature fade this Friday through Sunday and receive a complimentary lavender steam hot towel treatment and cooling scalp massage. Limited slots available—tap Reserve Now!',
        //     'post_type' => 'Promotion',
        //     'status' => 'published',
        //     'published_at' => now()->subDays(2),
        // ]);
        // $post1->images()->create([
        //     'url' => 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
        //     'sort_order' => 0,
        // ]);

        // $post2 = $shop1->posts()->create([
        //     'title' => '✨ Welcome Master Barber Miguel to the Fresh Fade Team',
        //     'content' => 'We are excited to welcome Master Miguel, with over 8 years of styling experience across Manila and Singapore specializing in precision taper work and textured fringe designs.',
        //     'post_type' => 'Announcement',
        //     'status' => 'published',
        //     'published_at' => now()->subDays(10),
        // ]);

        // Reviews for Shop 1
        // $shop1->reviews()->createMany([
        //     [
        //         'customer_name' => 'Mark Anthony Ramos',
        //         'rating' => 5,
        //         'comment' => 'Hands down the cleanest fade in BGC! Master Marco gave me exactly what I wanted. The hot towel at the end was pure relaxation.',
        //         'owner_reply' => 'Salamat Mark! Always a pleasure having you in the chair. See you next month!',
        //         'owner_replied_at' => now()->subDays(3),
        //     ],
        //     [
        //         'customer_name' => 'Carlos Mendoza',
        //         'rating' => 5,
        //         'comment' => 'Super fast online booking on BarberMap! No waiting in line, barbers are very punctual and accommodating. 10/10 recommend.',
        //     ],
        //     [
        //         'customer_name' => 'Angelo Reyes',
        //         'rating' => 4,
        //         'comment' => 'Great ambiance and very professional barbers. Cold complimentary water and great hiphop playlist.',
        //     ],
        // ]);

        // Sample Reservations for Shop 1
        // $service1 = $shop1->services()->first();
        // $shop1->reservations()->createMany([
        //     [
        //         'shop_service_id' => $service1->id,
        //         'customer_name' => 'David Lim',
        //         'customer_email' => 'david.lim@example.com',
        //         'customer_phone' => '09175551234',
        //         'reservation_date' => now()->toDateString(),
        //         'start_time' => '10:00:00',
        //         'end_time' => '10:45:00',
        //         'total_price' => 250.00,
        //         'status' => 'confirmed',
        //         'notes' => 'Skin fade taper, keep top textured.',
        //     ],
        //     [
        //         'shop_service_id' => $service1->id,
        //         'customer_name' => 'Jerome Santos',
        //         'customer_email' => 'jerome.santos@example.com',
        //         'customer_phone' => '09176662345',
        //         'reservation_date' => now()->addDay()->toDateString(),
        //         'start_time' => '14:30:00',
        //         'end_time' => '15:15:00',
        //         'total_price' => 250.00,
        //         'status' => 'confirmed',
        //     ],
        // ]);

        // 5. Shop 2: Heritage Grooming Co. (Makati City - Active)
        // $owner2 = User::create([
        //     'name' => 'Mateo Gomez',
        //     'email' => 'mateo@heritagegrooming.ph',
        //     'password' => Hash::make('password123'),
        //     'phone' => '09181119999',
        //     'role' => 'shop_owner',
        //     'status' => 'active',
        // ]);

        // $shop2 = Shop::create([
        //     'user_id' => $owner2->id,
        //     'name' => 'Heritage Grooming Co.',
        //     'slug' => 'heritage-grooming-co',
        //     'tagline' => 'Traditional Barbering with Modern Sophistication',
        //     'description' => 'Located in Poblacion Makati, Heritage Grooming Co. is an artisanal men’s sanctuary offering traditional straight razor cuts, classic pompadours, scalp massages, and premium beard grooming.',
        //     'phone' => '09181119999',
        //     'email' => 'mateo@heritagegrooming.ph',
        //     'address' => 'Guiguinto St., Poblacion',
        //     'city' => 'Makati',
        //     'barangay' => 'Poblacion',
        //     'logo_url' => 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80',
        //     'cover_url' => 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1400&q=80',
        //     'status' => 'active',
        //     'rating_avg' => 4.85,
        //     'reviews_count' => 32,
        //     'starting_price' => 190.00,
        // ]);

        // $shop2->location()->create([
        //     'latitude' => 14.5652,
        //     'longitude' => 121.0331,
        //     'formatted_address' => 'Guiguinto St., Poblacion, Makati, Metro Manila',
        //     'is_marker_visible' => true,
        // ]);

        // Subscription::create([
        //     'shop_id' => $shop2->id,
        //     'plan_id' => $plan->id,
        //     'status' => 'active',
        //     'price_paid' => 350.00,
        //     'starts_at' => now()->subDays(10),
        //     'expires_at' => now()->addDays(20),
        // ]);

        // $shop2->services()->createMany([
        //     ['name' => 'Gentleman Executive Haircut', 'description' => 'Classic custom cut tailored to facial structure.', 'price' => 190.00, 'duration_minutes' => 45, 'is_active' => true],
        //     ['name' => 'Straight Razor Hot Lather Shave', 'description' => 'Traditional wet shave with badger brush lather.', 'price' => 240.00, 'duration_minutes' => 40, 'is_active' => true],
        //     ['name' => 'Beard Sculpting & Conditioning', 'description' => 'Trimming, lining, and organic beard butter massage.', 'price' => 200.00, 'duration_minutes' => 30, 'is_active' => true],
        // ]);

        // for ($d = 0; $d <= 6; $d++) {
        //     $shop2->hours()->create([
        //         'day_of_week' => $d,
        //         'open_time' => '10:00:00',
        //         'close_time' => '21:00:00',
        //         'is_closed' => false,
        //     ]);
        // }

        // $shop2->portfolio()->createMany([
        //     ['url' => 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=600&q=80', 'title' => 'Classic Scissor Taper', 'category' => 'Classic'],
        //     ['url' => 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80', 'title' => 'Full Beard Trim', 'category' => 'Beard'],
        // ]);

        // 6. Shop 3: Fade Republic Barbershop (Quezon City - Active)
        // $owner3 = User::create([
        //     'name' => 'Rafael Bautista',
        //     'email' => 'rafael@faderepublic.ph',
        //     'password' => Hash::make('password123'),
        //     'phone' => '09172228888',
        //     'role' => 'shop_owner',
        //     'status' => 'active',
        // ]);

        // $shop3 = Shop::create([
        //     'user_id' => $owner3->id,
        //     'name' => 'Fade Republic Studio',
        //     'slug' => 'fade-republic-studio',
        //     'tagline' => 'Precision Fades & Urban Street Cuts',
        //     'description' => 'The favorite spot for urban fades, mullet designs, crop tops, and crisp lineups in Tomas Morato, Quezon City.',
        //     'phone' => '09172228888',
        //     'email' => 'rafael@faderepublic.ph',
        //     'address' => 'Tomas Morato Ave cor. Sct. Lozano St.',
        //     'city' => 'Quezon City',
        //     'barangay' => 'Laging Handa',
        //     'logo_url' => 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80',
        //     'cover_url' => 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=80',
        //     'status' => 'active',
        //     'rating_avg' => 4.92,
        //     'reviews_count' => 56,
        //     'starting_price' => 160.00,
        // ]);

        // $shop3->location()->create([
        //     'latitude' => 14.6343,
        //     'longitude' => 121.0345,
        //     'formatted_address' => 'Tomas Morato Ave, Quezon City, Metro Manila',
        //     'is_marker_visible' => true,
        // ]);

        // Subscription::create([
        //     'shop_id' => $shop3->id,
        //     'plan_id' => $plan->id,
        //     'status' => 'active',
        //     'price_paid' => 350.00,
        //     'starts_at' => now()->subDays(2),
        //     'expires_at' => now()->addDays(28),
        // ]);

        // $shop3->services()->createMany([
        //     ['name' => 'High Skin Fade', 'description' => 'High skin fade with top textured scissor blending.', 'price' => 200.00, 'duration_minutes' => 45, 'is_active' => true],
        //     ['name' => 'Standard Cut', 'description' => 'Quick, neat everyday haircut.', 'price' => 160.00, 'duration_minutes' => 30, 'is_active' => true],
        // ]);

        // for ($d = 0; $d <= 6; $d++) {
        //     $shop3->hours()->create([
        //         'day_of_week' => $d,
        //         'open_time' => '10:00:00',
        //         'close_time' => '21:00:00',
        //         'is_closed' => false,
        //     ]);
        // }

        // 7. Shop 4: Blades & Brews (Pasig - Active)
        // $owner4 = User::create([
        //     'name' => 'Gabriel Tan',
        //     'email' => 'gab@bladesbrews.ph',
        //     'password' => Hash::make('password123'),
        //     'phone' => '09174447777',
        //     'role' => 'shop_owner',
        //     'status' => 'active',
        // ]);

        // $shop4 = Shop::create([
        //     'user_id' => $owner4->id,
        //     'name' => 'Blades & Brews Grooming Lounge',
        //     'slug' => 'blades-brews-lounge',
        //     'tagline' => 'Chill cuts paired with craft coffee',
        //     'description' => 'Kapitolyo’s premier grooming lounge. Come in for a razor fade and enjoy artisanal espresso on the house while you wait.',
        //     'phone' => '09174447777',
        //     'email' => 'gab@bladesbrews.ph',
        //     'address' => 'East Capitol Drive, Kapitolyo',
        //     'city' => 'Pasig',
        //     'barangay' => 'Kapitolyo',
        //     'logo_url' => 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&q=80',
        //     'cover_url' => 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1400&q=80',
        //     'status' => 'active',
        //     'rating_avg' => 4.78,
        //     'reviews_count' => 19,
        //     'starting_price' => 200.00,
        // ]);

        // $shop4->location()->create([
        //     'latitude' => 14.5728,
        //     'longitude' => 121.0583,
        //     'formatted_address' => 'East Capitol Drive, Kapitolyo, Pasig, Metro Manila',
        //     'is_marker_visible' => true,
        // ]);

        // Subscription::create([
        //     'shop_id' => $shop4->id,
        //     'plan_id' => $plan->id,
        //     'status' => 'active',
        //     'price_paid' => 350.00,
        //     'starts_at' => now()->subDays(1),
        //     'expires_at' => now()->addDays(29),
        // ]);

        // $shop4->services()->createMany([
        //     ['name' => 'Signature Cut & Espresso', 'description' => 'Custom haircut + complimentary specialty latte.', 'price' => 280.00, 'duration_minutes' => 45, 'is_active' => true],
        //     ['name' => 'Beard Sculpt & Shave', 'description' => 'Razor sharp lines with cold towel finish.', 'price' => 200.00, 'duration_minutes' => 30, 'is_active' => true],
        // ]);

        // for ($d = 0; $d <= 6; $d++) {
        //     $shop4->hours()->create([
        //         'day_of_week' => $d,
        //         'open_time' => '10:00:00',
        //         'close_time' => '21:00:00',
        //         'is_closed' => false,
        //     ]);
        // }

        // 8. Pending Payment Shop (Must NOT appear on public map)
        // $pendingOwner = User::create([
        //     'name' => 'Pedro Martinez',
        //     'email' => 'pending@barbermap.com',
        //     'password' => Hash::make('password123'),
        //     'phone' => '09177778888',
        //     'role' => 'shop_owner',
        //     'status' => 'active',
        // ]);

        // $pendingShop = Shop::create([
        //     'user_id' => $pendingOwner->id,
        //     'name' => 'The Barber Cave Manila',
        //     'slug' => 'the-barber-cave-manila',
        //     'tagline' => 'Underground vibes and razor sharp cuts',
        //     'description' => 'Newly registered shop awaiting subscription verification.',
        //     'phone' => '09177778888',
        //     'email' => 'pending@barbermap.com',
        //     'address' => 'Katipunan Ave, Loyola Heights',
        //     'city' => 'Quezon City',
        //     'barangay' => 'Loyola Heights',
        //     'status' => 'under_review',
        //     'starting_price' => 170.00,
        // ]);

        // $pendingShop->location()->create([
        //     'latitude' => 14.6465,
        //     'longitude' => 121.0772,
        //     'formatted_address' => 'Katipunan Ave, Quezon City, Metro Manila',
        //     'is_marker_visible' => true,
        // ]);

        // // Submit pending payment for admin verification queue demonstration
        // Payment::create([
        //     'shop_id' => $pendingShop->id,
        //     'user_id' => $pendingOwner->id,
        //     'payment_method' => 'Maya',
        //     'amount' => 350.00,
        //     'reference_number' => 'MY-8819203941',
        //     'receipt_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        //     'payment_date' => now()->toDateString(),
        //     'status' => 'pending',
        // ]);

        // // Log admin activity
        // AdminActivityLog::log(
        //     $admin->id,
        //     'Initialized BarberMap seed dataset and verified billing configurations',
        //     'System',
        //     null,
        //     null,
        //     ['initialized' => true]
        // );
    }
}
