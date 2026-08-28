<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'latitude',
        'longitude',
        'plus_code',
        'formatted_address',
        'is_marker_visible',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_marker_visible' => 'boolean',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
