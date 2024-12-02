<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItineraryDestination extends Model
{
    use HasFactory;

    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id')->withTrashed();
    }

    public function secondDestination()
    {
        return $this->belongsTo(Destination::class, 'second_destination_id')->withTrashed();
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function itinerary()
    {
        return $this->belongsTo(Itinerary::class, 'itinerary_id');
    }

}
