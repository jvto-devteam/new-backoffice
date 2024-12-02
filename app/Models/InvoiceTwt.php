<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceTwt extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_no',
        'invoice_date',
        'status',
        'total',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'total' => 'double',
    ];

    /**
     * Get the booking that owns the invoice.
     */
    
    public function details()
    {
        return $this->hasMany(InvoiceTwtDetail::class);
    }    
}