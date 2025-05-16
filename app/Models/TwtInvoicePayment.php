<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TwtInvoicePayment extends Model
{
    use HasFactory;

    protected $table = 'twt_invoice_payments';

    protected $fillable = [
        'invoice_id',
        'payment_date',
        'amount',
        'transaction_reference',
        'notes',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the invoice that owns the payment.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(TwtInvoice::class, 'invoice_id');
    }
}