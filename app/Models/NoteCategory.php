<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NoteCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'color'];

    public function booking()
    {
        return $this->hasMany(Booking::class,'booking_id');
    }
}
