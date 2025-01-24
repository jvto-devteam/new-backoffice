<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookHotelMeal extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'booking_itinerary_id',
        'hotel_id',
        'meals',
        'qty',
        'price',
        'subtotal',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function bookHotel()
    {
        return $this->belongsTo(BookHotel::class);
    }

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }
}
