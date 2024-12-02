<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookAddOn extends Model
{
    use HasFactory;

    public function addOnPackage()
    {
        return $this->belongsTo(AddOnPackage::class, 'add_on_package_id');
    }

    public function addOn()
    {
        return $this->belongsTo(AddOn::class, 'add_on_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
