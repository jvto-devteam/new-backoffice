<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function packagePrice()
    {
        return $this->belongsTo(PackagePrice::class, 'package_price_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

}
