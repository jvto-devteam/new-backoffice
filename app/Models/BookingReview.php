<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingReview extends Model
{
    use HasFactory;

    public function crewReview()
    {
        return $this->hasMany(CrewReview::class, 'booking_review_id');
    }

}
