<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExpenseRefund extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'type',
        'item',
        'price',
        'qty',
        'refund_to',
        'proof_image',
        'subtotal',
        'status',
    ];

    // Define the possible status values
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    // Define the possible types
    const TYPE_REFUND = 'refund';
    const TYPE_PENALTY = 'penalty';

    // Default values
    protected $attributes = [
        'status' => self::STATUS_PENDING,
        'type' => self::TYPE_REFUND,  // Add default type
    ];


    // Relation to Booking
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}