<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItineraryRouteDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'itinerary_route_id',
        'time',
        'activity_category_id',
        'activity',
        'pro_tips',
    ];

    public function itineraryRoute()
    {
        return $this->belongsTo(ItineraryRoute::class);
    }

    public function activityCategory()
    {
        return $this->belongsTo(ActivityCategory::class);
    }
}
