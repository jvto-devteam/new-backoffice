<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Itinerary extends Model
{
    use HasFactory,SoftDeletes;

    protected $table = "itineraries";

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function itineraryDestination()
    {
        return $this->hasOne(ItineraryDestination::class, 'itinerary_id');
    }

    public function itineraryMeals()
    {
        return $this->hasMany(ItineraryMeal::class, 'itinerary_id');
    }

    public function itineraryDetail()
    {
        return $this->hasMany(ItineraryDetail::class, 'itinerary_id');
    }

    public function itineraryMealRegular()
    {
        return $this->itineraryMeals()->where('price_plan_id',2);
    }
}
