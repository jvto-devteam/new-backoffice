<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrewReview extends Model
{
    use HasFactory;

    public function crew()
    {
        return $this->belongsTo(GuideDriver::class, 'crew_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
