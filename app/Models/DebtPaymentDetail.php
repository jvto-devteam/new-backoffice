<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DebtPaymentDetail extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'payment_id',
        'booking_id',
        'item_id',
        'amount',
        'item_data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'item_data' => 'array',
    ];

    /**
     * Get the payment that owns the detail.
     */
    public function payment()
    {
        return $this->belongsTo(DebtPayment::class, 'payment_id');
    }

    /**
     * Get the booking associated with the detail.
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
    
    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute()
    {
        return 'Rp ' . number_format($this->amount, 0, ',', '.');
    }
    
    /**
     * Get specific data from the item_data JSON field
     */
    public function getItemDataValue($key, $default = null)
    {
        return data_get($this->item_data, $key, $default);
    }
}