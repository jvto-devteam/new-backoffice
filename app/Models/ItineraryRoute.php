<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItineraryRoute extends Model
{
    use HasFactory;

    protected $fillable = [
        'route',
        'title',
        'description',
        'activity_start_id',
        'activity_end_id',
    ];

    public function activityStart()
    {
        return $this->belongsTo(ActivityStart::class);
    }

    public function activityEnd()
    {
        return $this->belongsTo(ActivityEnd::class);
    }

    public function details()
    {
        return $this->hasMany(ItineraryRouteDetail::class);
    }

    public function destinations()
    {
        return $this->hasMany(ItineraryRouteDestination::class);
    }
}
