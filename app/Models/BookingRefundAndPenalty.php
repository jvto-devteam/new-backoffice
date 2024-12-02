<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingRefundAndPenalty extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'item',
        'quantity',
        'price',
        'subtotal',
        'attachment',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
