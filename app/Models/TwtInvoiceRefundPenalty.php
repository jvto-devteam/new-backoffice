<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TwtInvoiceRefundPenalty extends Model
{
    use HasFactory;

    protected $table = 'twt_invoice_refunds_penalties';

    protected $fillable = [
        'invoice_id',
        'expense_refund_id',
        'total_amount',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the invoice that owns the refund/penalty item.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(TwtInvoice::class, 'invoice_id');
    }

    /**
     * Get the expense refund associated with the invoice item.
     */
    public function expenseRefund(): BelongsTo
    {
        return $this->belongsTo(ExpenseRefund::class);
    }
}