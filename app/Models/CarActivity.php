<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarActivity extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'car_id',
        'car_activity_code',
        'name',
        'unit',
        'formula',
        'price',
    ];

    /**
     * Get the car associated with this activity.
     */
    public function car()
    {
        return $this->belongsTo(Car::class, 'car_id');
    }
}
