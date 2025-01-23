<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookOthersActivity extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'others_activity_id',
        'qty',
        'price',
        'subtotal',
        'status_paid',
        'paid_date',
        'is_debt',
    ];

    /**
     * Define the relationship to OthersActivity.
     */
    public function othersActivity()
    {
        return $this->belongsTo(OthersActivity::class);
    }
}
