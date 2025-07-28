<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventSequence extends Model
{
    protected $fillable = ['no', 'itinerary_id', 'activity_destination_id'];

    public function itinerary()
    {
        return $this->belongsTo(Itinerary::class);
    }

    public function activityDestination()
    {
        return $this->belongsTo(ActivityDestination::class);
    }
}
