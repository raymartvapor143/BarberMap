<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_post_id',
        'url',
        'sort_order',
    ];

    public function post()
    {
        return $this->belongsTo(ShopPost::class, 'shop_post_id');
    }
}
