<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Participant extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_id',
        'title',
        'full_name',
        'gender',
        'flight_number',
        'passport_number',
        'tshirt_size',
        'dietary_restriction',
        'car_number',
        'seat_number',
        'room_number',
    ];

    /**
     * Get the booking that this participant belongs to.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}