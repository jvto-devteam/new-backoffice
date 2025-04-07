<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookCrewActivity extends Model
{
    public function crewRole()
    {
        return $this->belongsTo(CrewRole::class);
    }
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
