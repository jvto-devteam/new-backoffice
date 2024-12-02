<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PriceCategory extends Model
{
    use HasFactory,SoftDeletes;

    protected $table = "price_categories";

    public function packagePrice()
    {
        return $this->hasOne(PackagePrice::class, 'price_category_id');
    }


}
