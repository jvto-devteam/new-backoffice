<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TwtInvoice extends Model
{
    use HasFactory;

    protected $table = 'twt_invoices';

    protected $fillable = [
        'invoice_number',
        'invoice_date',
        'agent_id',
        'total_bookings',
        'total_additionals',
        'total_refunds_penalties',
        'grand_total',
        'status',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'total_bookings' => 'decimal:2',
        'total_additionals' => 'decimal:2',
        'total_refunds_penalties' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    /**
     * Get the agent that owns the invoice.
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    /**
     * Get the booking items for the invoice.
     */
    public function bookingItems(): HasMany
    {
        return $this->hasMany(TwtInvoiceBooking::class, 'invoice_id');
    }

    /**
     * Get the additional items for the invoice.
     */
    public function additionalItems(): HasMany
    {
        return $this->hasMany(TwtInvoiceAdditional::class, 'invoice_id');
    }

    /**
     * Get the refund/penalty items for the invoice.
     */
    public function refundPenaltyItems(): HasMany
    {
        return $this->hasMany(TwtInvoiceRefundPenalty::class, 'invoice_id');
    }

    /**
     * Get the payments for the invoice.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(TwtInvoicePayment::class, 'invoice_id');
    }

    /**
     * Calculate the grand total of the invoice.
     */
    public function calculateTotal(): void
    {
        $this->total_bookings = $this->bookingItems()->sum('total_amount');
        $this->total_additionals = $this->additionalItems()->sum('total_amount');
        $this->total_refunds_penalties = $this->refundPenaltyItems()->sum('total_amount');
        $this->grand_total = $this->total_bookings + $this->total_additionals + $this->total_refunds_penalties;
        $this->save();
    }
}