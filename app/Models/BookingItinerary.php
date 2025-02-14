<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingItinerary extends Model
{
    use HasFactory;

    public function bookHotel()
    {
        return $this->hasMany(BookHotel::class, 'booking_itinerary_id');
    }

    public function bookRoomHotel()
    {
        return $this->hasMany(BookRoomHotel::class, 'booking_itinerary_id');
    }

    public function activityStart()
    {
        return $this->belongsTo(ActivityStart::class, 'activity_start_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

}
