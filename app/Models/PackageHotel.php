<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageHotel extends Model
{
    use HasFactory;

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'hotel_id')->withTrashed();
    }
}
