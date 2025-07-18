<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItineraryRouteDestination extends Model
{
    use HasFactory;

    protected $table = 'itinerary_route_destinations';

    protected $fillable = [
        'itinerary_route_id',
        'destination_id',
    ];

    public function itineraryRoute()
    {
        return $this->belongsTo(ItineraryRoute::class);
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }
}
