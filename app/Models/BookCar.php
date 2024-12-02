<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookCar extends Model
{
    use HasFactory;
    protected $table = 'book_cars';
    public function car()
    {
        return $this->belongsTo(Car::class, 'car_id');
    }

}
