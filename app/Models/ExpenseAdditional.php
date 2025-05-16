<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExpenseAdditional extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'item',
        'description',
        'price',
        'qty',
        'subtotal',
        'image',
        'bill',
        'request_date',
        'request_by',
        'submit_date',
        'submit_by',
        'status',
    ];

    // Relasi opsional
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
