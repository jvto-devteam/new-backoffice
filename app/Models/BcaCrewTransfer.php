<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BcaCrewTransfer extends Model
{
    protected $fillable = [
        'booking_id',
        'transfer_date',
        'transfer_time',
        'amount',
        'fee',
        'to_account',
        'to_bank',
        'reference_no',
        'remark',
        'booking_code_matched',
        'email_message_id',
        'email_received_at',
    ];

    protected $casts = [
        'transfer_date'     => 'date',
        'amount'            => 'integer',
        'fee'               => 'integer',
        'email_received_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
