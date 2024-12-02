<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PackagePrice extends Model
{
    use HasFactory,SoftDeletes;

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function priceCategory()
    {
        return $this->belongsTo(PriceCategory::class, 'price_category_id');
    }

    public function cart()
    {
        return $this->hasOne(Cart::class, 'package_price_id');
    }

}
