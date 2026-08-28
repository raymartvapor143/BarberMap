<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'title',
        'content',
        'post_type',
        'status',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function images()
    {
        return $this->hasMany(PostImage::class)->orderBy('sort_order');
    }
}
