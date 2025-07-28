<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ActivityDestination extends Model
{
    use HasFactory;

    protected $fillable = [
        'name','activity_code', 'description', 'activity_category_id', 'destination_id', 'from_destination_id', 'to_destination_id',
        'duration_hours', 'difficulty_level', 'physical_requirements',
        'health_advisories', 'required_gear', 'tags', 'best_time_to_visit'
    ];

    public function category() {
        return $this->belongsTo(ActivityCategory::class, 'activity_category_id');
    }

    public function destination() {
        return $this->belongsTo(Destination::class);
    }

    public function medias() {
        return $this->hasMany(ActivityDestinationMedia::class);
    }

    public function sequences() {
        return $this->hasMany(EventSequence::class);
    }
}
