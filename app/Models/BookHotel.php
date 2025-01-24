<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookHotel extends Model
{
    use HasFactory;

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id')->withTrashed();
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function bookingItinerary()
    {
        return $this->belongsTo(BookingItinerary::class, 'booking_itinerary_id');
    }

    public function bookRoom()
    {
        return $this->hasMany(BookRoomHotel::class, 'book_hotel_id');
    }

    public function bookHotelMeal()
    {
        return $this->hasMany(BookHotelMeal::class, 'book_hotel_id');
    }

}
