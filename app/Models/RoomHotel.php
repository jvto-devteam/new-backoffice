<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RoomHotel extends Model
{
    use HasFactory,SoftDeletes;
    public function hotel()
    {
        return $this->belongsTo(Hotel::class,'hotel_id');
    }
    public function roomPhoto()
    {
        return $this->hasMany(RoomPhoto::class, 'room_hotel_id');
    }

}
