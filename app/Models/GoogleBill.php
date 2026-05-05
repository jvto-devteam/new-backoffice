<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoogleBill extends Model
{
    protected $fillable = ['month', 'year', 'google_cloud', 'google_ads'];

    protected $casts = [
        'google_cloud' => 'integer',
        'google_ads'   => 'integer',
    ];
}
