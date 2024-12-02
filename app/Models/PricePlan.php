<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricePlan extends Model
{
    use HasFactory;

    public function accommodation()
    {
        return $this->hasMany(PackageHotel::class, 'price_plan_id');
    }

    public function transportation()
    {
        return $this->hasMany(PackageTransportation::class, 'price_plan_id');
    }

    public function meals()
    {
        return $this->hasOne(PackageMeal::class, 'price_plan_id');
    }

}
