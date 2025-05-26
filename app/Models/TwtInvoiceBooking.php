<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TwtInvoiceBooking extends Model
{
    use HasFactory;

    protected $table = 'twt_invoice_bookings';

    protected $fillable = [
        'invoice_id',
        'booking_id',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the invoice that owns the booking item.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(TwtInvoice::class, 'invoice_id');
    }

    /**
     * Get the booking associated with the invoice item.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}