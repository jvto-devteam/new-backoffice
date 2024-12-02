<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingDetail extends Model
{
    use HasFactory;

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id')->withTrashed();
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function pricePlan()
    {
        return $this->belongsTo(PricePlan::class, 'price_plan_id');
    }

}
