<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PackageBanner extends Model
{
    use HasFactory,SoftDeletes;

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function gallery()
    {
        return $this->belongsTo(Gallery::class, 'gallery_id');
    }
}
