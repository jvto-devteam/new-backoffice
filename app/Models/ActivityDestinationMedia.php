<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityDestinationMedia extends Model
{
    protected $table = 'activity_destination_medias';

    protected $fillable = [
        'activity_destination_id',
        'url',
        'type',
        'alt_text',
        'caption',
    ];

    public function activityDestination()
    {
        return $this->belongsTo(ActivityDestination::class);
    }
}
