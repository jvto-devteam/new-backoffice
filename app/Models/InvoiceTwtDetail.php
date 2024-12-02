<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceTwtDetail extends Model
{
    use HasFactory;

    protected $fillable = ['invoice_twt_id', 'booking_id'];    

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

}
