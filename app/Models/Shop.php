<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Shop extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'tagline',
        'description',
        'phone',
        'email',
        'address',
        'city',
        'barangay',
        'logo_url',
        'cover_url',
        'social_links',
        'status',
        'rating_avg',
        'reviews_count',
        'starting_price',
    ];

    protected $casts = [
        'social_links' => 'array',
        'rating_avg' => 'float',
        'starting_price' => 'float',
        'reviews_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($shop) {
            if (empty($shop->slug)) {
                $shop->slug = Str::slug($shop->name) . '-' . Str::random(5);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function location()
    {
        return $this->hasOne(ShopLocation::class);
    }

    public function services()
    {
        return $this->hasMany(ShopService::class);
    }

    public function hours()
    {
        return $this->hasMany(ShopHour::class)->orderBy('day_of_week');
    }

    public function breaks()
    {
        return $this->hasMany(ShopBreak::class);
    }

    public function photos()
    {
        return $this->hasMany(ShopPhoto::class)->orderBy('sort_order');
    }

    public function portfolio()
    {
        return $this->hasMany(HaircutPortfolio::class);
    }

    public function posts()
    {
        return $this->hasMany(ShopPost::class)->latest();
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class)->latest();
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->latestOfMany();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class)->latest();
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class)->latest();
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class)->latest();
    }

    public function reviews()
    {
        return $this->hasMany(Review::class)->where('is_hidden', false)->latest();
    }

    public function isPubliclyVisible(): bool
    {
        return $this->status === 'active' && 
               $this->location && 
               $this->location->is_marker_visible && 
               $this->hasActiveSubscription();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscriptions()
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->exists();
    }
}
