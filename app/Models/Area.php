<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    public function hotel()
    {
        return $this->hasMany(Hotel::class, 'area_id');
    }

    public function service()
    {
        return $this->hasMany(Service::class, 'area_id');
    }

    public function bookItineraryDetail()
    {
        return $this->hasMany(BookItineraryDetail::class, 'area_id');
    }
}
