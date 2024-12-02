<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Hotel extends Model
{
    use HasFactory, SoftDeletes;

    public function roomHotel()
    {
        return $this->hasMany(RoomHotel::class);
    }

    public function service()
    {
        return $this->hasMany(HotelService::class, 'hotel_id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id');
    }

    public function bookHotel()
    {
        return $this->hasMany(BookHotel::class, 'hotel_id');
    }
}
