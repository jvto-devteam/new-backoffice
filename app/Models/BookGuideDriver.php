<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookGuideDriver extends Model
{
    use HasFactory;

    public function person()
    {
        return $this->belongsTo(GuideDriver::class, 'guide_id')->withTrashed();
    }
    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
