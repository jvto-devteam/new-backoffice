<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExpenseRevision extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'qty',
        'item',
        'price_before',
        'price_after',
        'total',
        'status',
        'reason',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
