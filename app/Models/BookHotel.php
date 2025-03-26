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

    // Custom attribute for total rooms
    public function getTotalRoomsAttribute()
    {
        return $this->bookRoom->sum('subtotal');
    }

    // Custom attribute for total meals
    public function getTotalMealsAttribute()
    {
        return $this->bookHotelMeal->sum('subtotal');
    }

    // Custom attribute for combined total
    public function getTotalAttribute()
    {
        return $this->total_rooms + $this->total_meals;
    }
}