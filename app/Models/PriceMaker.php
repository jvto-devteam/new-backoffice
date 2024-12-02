<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceMaker extends Model
{
    use HasFactory;

    public function duration()
    {
        return $this->belongsTo(Duration::class, 'duration_id');
    }

    public function priceMakerLocation()
    {
        return $this->hasMany(PriceMakerLocation::class, 'price_maker_id');
    }

    public function priceMakerLocationDetail()
    {
        return $this->hasMany(PriceMakerLocationDetail::class, 'price_maker_id');
    }

}
