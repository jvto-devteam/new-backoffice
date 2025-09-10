<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Gallery extends Model
{
    use HasFactory,SoftDeletes;

    protected $table = "galleries";

    public function destination()
    {
        return $this->hasOne(Destination::class, 'gallery_id');
    }

    public function packageBanner()
    {
        return $this->hasOne(PackageBanner::class, 'gallery_id');
    }

    public function destinationGallery()
    {
        return $this->belongsTo(Destination::class, 'destination_id');
    }

}
