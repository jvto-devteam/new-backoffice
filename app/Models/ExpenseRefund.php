<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExpenseRefund extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'item',
        'price',
        'qty',
        'subtotal',
        'status',
    ];

    // Define the possible status values
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    // Default status
    protected $attributes = [
        'status' => self::STATUS_PENDING,
    ];

    // Relation to Booking
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}