<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DebtPayment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'payment_number',
        'vendor_id',
        'item_type',
        'payment_date',
        'payment_method_id',
        'payment_proof',
        'note',
        'total_amount',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'payment_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the vendor associated with the payment.
     */
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Get the payment method associated with the payment.
     */
    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * Get the details for this payment.
     */
    public function details()
    {
        return $this->hasMany(DebtPaymentDetail::class, 'payment_id');
    }
    
    /**
     * Get formatted total amount
     */
    public function getFormattedAmountAttribute()
    {
        return 'Rp ' . number_format($this->total_amount, 0, ',', '.');
    }
    
    /**
     * Get formatted payment date
     */
    public function getFormattedDateAttribute()
    {
        return $this->payment_date->format('d F Y');
    }
}