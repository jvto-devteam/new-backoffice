<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookItineraryDetail extends Model
{
    use HasFactory;

    protected $table = 'book_itinerary_details';

    public function bookingItinerary()
    {
        return $this->belongsTo(BookItinerary::class, 'book_itinerary_id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }
}
