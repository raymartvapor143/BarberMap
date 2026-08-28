<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Subscription Plans
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2)->default(350.00);
            $table->string('currency', 10)->default('PHP');
            $table->string('interval', 20)->default('monthly');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Billing & Admin Settings (Key-Value Dynamic Config)
        Schema::create('billing_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, number, boolean, json
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // 3. Barber Shops
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address');
            $table->string('city')->default('Metro Manila');
            $table->string('barangay')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('cover_url')->nullable();
            $table->json('social_links')->nullable();
            $table->string('status')->default('pending_payment'); // pending_payment, under_review, active, expired, suspended
            $table->decimal('rating_avg', 3, 2)->default(0.00);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->decimal('starting_price', 10, 2)->default(150.00);
            $table->timestamps();
        });

        // 4. Shop Locations (Map Coordinates)
        Schema::create('shop_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('formatted_address')->nullable();
            $table->boolean('is_marker_visible')->default(true);
            $table->timestamps();
        });

        // 5. Shop Services
        Schema::create('shop_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->unsignedInteger('duration_minutes')->default(45);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 6. Shop Business Hours (Monday to Sunday)
        Schema::create('shop_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week'); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            $table->time('open_time')->default('09:00:00');
            $table->time('close_time')->default('20:00:00');
            $table->boolean('is_closed')->default(false);
            $table->timestamps();
        });

        // 7. Shop Break Times
        Schema::create('shop_breaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week')->nullable();
            $table->time('break_start')->default('12:00:00');
            $table->time('break_end')->default('13:00:00');
            $table->string('label')->default('Lunch Break');
            $table->timestamps();
        });

        // 8. Shop Gallery Photos
        Schema::create('shop_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->string('caption')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        // 9. Haircut Portfolio
        Schema::create('haircut_portfolio', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->string('title')->nullable();
            $table->string('category')->default('Fade'); // Fade, Classic, Beard, Crop, Kids, Other
            $table->json('tags')->nullable();
            $table->timestamps();
        });

        // 10. Shop Posts / CMS
        Schema::create('shop_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->string('post_type')->default('Announcement'); // Announcement, Promotion, Haircut, Update
            $table->string('status')->default('published'); // draft, published, unpublished, removed
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        // 11. Post Images
        Schema::create('post_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_post_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // 12. Subscriptions
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained('subscription_plans')->nullOnDelete();
            $table->string('status')->default('active'); // active, expired, suspended, cancelled
            $table->decimal('price_paid', 10, 2);
            $table->timestamp('starts_at');
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        // 13. Payments & Receipts
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('payment_method'); // GCash, Maya
            $table->decimal('amount', 10, 2);
            $table->string('reference_number');
            $table->string('receipt_url');
            $table->date('payment_date');
            $table->string('status')->default('pending'); // pending, under_review, approved, rejected
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        // 14. Invoices (Immutable snapshots)
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('billing_period_start');
            $table->timestamp('billing_period_end');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('PHP');
            $table->string('payment_method');
            $table->string('reference_number');
            $table->string('status')->default('PAID');
            $table->timestamps();
        });

        // 15. Reservations
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shop_service_id')->constrained('shop_services')->cascadeOnDelete();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->date('reservation_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('total_price', 10, 2);
            $table->string('status')->default('pending'); // pending, confirmed, cancelled, completed, no-show
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 16. Reviews & Feedback
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->string('customer_name');
            $table->unsignedTinyInteger('rating')->default(5); // 1-5
            $table->text('comment');
            $table->text('owner_reply')->nullable();
            $table->timestamp('owner_replied_at')->nullable();
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();
        });

        // 17. Content & Review Moderation Reports
        Schema::create('content_reports', function (Blueprint $table) {
            $table->id();
            $table->string('reportable_type'); // 'shop_post', 'review', 'shop'
            $table->unsignedBigInteger('reportable_id');
            $table->string('reporter_name')->nullable();
            $table->string('reporter_email')->nullable();
            $table->text('reason');
            $table->string('status')->default('pending'); // pending, reviewed, dismissed, resolved
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        // 18. Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('info'); // info, success, warning, danger
            $table->string('link')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // 19. Admin Activity Audit Logs
        Schema::create('admin_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->string('action');
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_activity_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('content_reports');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('post_images');
        Schema::dropIfExists('shop_posts');
        Schema::dropIfExists('haircut_portfolio');
        Schema::dropIfExists('shop_photos');
        Schema::dropIfExists('shop_breaks');
        Schema::dropIfExists('shop_hours');
        Schema::dropIfExists('shop_services');
        Schema::dropIfExists('shop_locations');
        Schema::dropIfExists('shops');
        Schema::dropIfExists('billing_settings');
        Schema::dropIfExists('subscription_plans');
    }
};
