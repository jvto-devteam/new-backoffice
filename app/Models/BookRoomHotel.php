<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class BookRoomHotel extends Model
{
    use HasFactory;
    
    protected $appends = ['current_date'];
    
    public function roomHotel()
    {
        return $this->belongsTo(RoomHotel::class, 'room_hotel_id');
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
    
    public function getCurrentDateAttribute()
    {
        if ($this->booking && $this->bookingItinerary) {
            $travelStartDate = Carbon::parse($this->booking->travel_date_start);
            $daysToAdd = $this->bookingItinerary->day - 1;
            
            return $travelStartDate->copy()->addDays($daysToAdd)->format('Y-m-d');
        }
        
        return null;
    }
}