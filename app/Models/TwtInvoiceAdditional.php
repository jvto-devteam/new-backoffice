<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TwtInvoiceAdditional extends Model
{
    use HasFactory;

    protected $table = 'twt_invoice_additionals';

    protected $fillable = [
        'invoice_id',
        'expense_additional_id',
        'total_amount',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the invoice that owns the additional item.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(TwtInvoice::class, 'invoice_id');
    }

    /**
     * Get the expense additional associated with the invoice item.
     */
    public function expenseAdditional(): BelongsTo
    {
        return $this->belongsTo(ExpenseAdditional::class);
    }
}