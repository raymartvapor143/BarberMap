<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopBreak extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'day_of_week',
        'break_start',
        'break_end',
        'label',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
