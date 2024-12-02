<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Destination extends Model
{
    use HasFactory,SoftDeletes;

    public function gallery()
    {
        return $this->belongsTo(Gallery::class, 'gallery_id');
    }

    public function galleries()
    {
        return $this->hasMany(Gallery::class, 'destination_id');
    }

    public function imagePanorama()
    {
        return $this->hasMany(ImagePanorama::class, 'destination_id');
    }

    public function packageDestination()
    {
        return $this->hasMany(PackageDestination::class, 'destination_id')
        ->whereHas('package', function($query) {
            $query->where('is_publish', '1');
            $query->where('category_id', '1');
        });
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function hotel()
    {
        return $this->hasOne(Hotel::class, 'destination_id');
    }

    public function activity()
    {
        return $this->hasMany(DestinationActivity::class);
    }    
}
