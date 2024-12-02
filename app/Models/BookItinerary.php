<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookItinerary extends Model
{
    use HasFactory;

    protected $table = 'book_itineraries';

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function startArea()
    {
        return $this->belongsTo(Area::class, 'start_area_id');
    }

    public function endArea()
    {
        return $this->belongsTo(Area::class, 'end_area_id');
    }
}
