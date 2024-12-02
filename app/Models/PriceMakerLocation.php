<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceMakerLocation extends Model
{
    use HasFactory;

    public function priceMaker()
    {
        return $this->belongsTo(PriceMaker::class, 'price_maker_id');
    }

    public function priceMakerLocationDetail()
    {
        return $this->hasMany(PriceMakerLocationDetail::class, 'price_maker_location_id');
    }

}
