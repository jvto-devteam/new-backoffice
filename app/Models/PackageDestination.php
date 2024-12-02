<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PackageDestination extends Model
{
    use HasFactory,SoftDeletes;

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id')->withTrashed();
    }
}
