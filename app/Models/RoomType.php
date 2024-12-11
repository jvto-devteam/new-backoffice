<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    use HasFactory;

    protected $table = 'room_types';

    protected $fillable = [
        'accommodation_id',
        'room_type',
        'rate_per_night',
        'include_breakfast',
        'include_dinner',
        'extra_bed_option',
    ];

    /**
     * Relation to accommodation.
     */
    public function accommodation()
    {
        return $this->belongsTo(Accommodation::class, 'accommodation_id');
    }
}
