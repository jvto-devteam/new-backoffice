<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookDestinationActivity extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'destination_id',
        'destination_activity_id',
        'qty',
        'price',
        'subtotal',
        'status_paid',
        'paid_date',
        'is_debt',
    ];

    /**
     * Define the relationship to DestinationActivity.
     */
    public function destinationActivity()
    {
        return $this->belongsTo(DestinationActivity::class);
    }
     
    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }
}
