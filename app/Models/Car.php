<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Car extends Model
{
    use HasFactory, SoftDeletes;

    public function bookCar()
    {
        return $this->hasMany(BookCar::class, 'car_id');
    }

    public function garage()
    {
        return $this->belongsTo(Garage::class, 'garage_id');
    }

}
