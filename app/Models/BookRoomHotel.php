<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookRoomHotel extends Model
{
    use HasFactory;
    public function roomHotel()
    {
        return $this->belongsTo(RoomHotel::class, 'room_hotel_id')->withTrashed();
    }

    public function bookHotel()
    {
        return $this->belongsTo(BookHotel::class, 'book_hotel_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function bookingItinerary()
    {
        return $this->belongsTo(BookingItinerary::class, 'booking_itinerary_id');
    }
}
