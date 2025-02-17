<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomPhoto extends Model
{
    use HasFactory;

    protected $table = 'room_photos';

    protected $fillable = [
        'hotel_id',
        'room_hotel_id',
        'photo'
    ];

    // Relasi ke Model Hotel
    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }

    // Relasi ke Model RoomHotel
    public function roomHotel()
    {
        return $this->belongsTo(RoomHotel::class, 'room_hotel_id');
    }
}
