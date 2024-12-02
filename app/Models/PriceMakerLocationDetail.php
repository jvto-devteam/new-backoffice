<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceMakerLocationDetail extends Model
{
    use HasFactory;

    public function priceMaker()
    {
        return $this->belongsTo(PriceMaker::class, 'price_maker_id');
    }

    public function priceMakerLocation()
    {
        return $this->belongsTo(PriceMakerLocation::class, 'price_maker_location_id');
    }
}
