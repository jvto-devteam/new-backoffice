<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomHotelConfiguration extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'hotel_id',
        'room_id',
        'pax',
        'qty',
    ];

    /**
     * Get the hotel associated with this configuration.
     */
    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }

    /**
     * Get the room associated with this configuration.
     */
    public function room()
    {
        return $this->belongsTo(RoomHotel::class, 'room_id');
    }
}
