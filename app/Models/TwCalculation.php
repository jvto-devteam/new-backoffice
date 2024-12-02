<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TwCalculation extends Model
{
    use HasFactory;

    public function twCalculationDetail()
    {
        return $this->hasMany(TwCalculationDetail::class, 'tw_calculation_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

}
