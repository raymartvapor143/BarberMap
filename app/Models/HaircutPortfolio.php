<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HaircutPortfolio extends Model
{
    use HasFactory;

    protected $table = 'haircut_portfolio';

    protected $fillable = [
        'shop_id',
        'url',
        'title',
        'category',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
