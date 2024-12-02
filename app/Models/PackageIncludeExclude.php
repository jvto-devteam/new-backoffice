<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PackageIncludeExclude extends Model
{
    use HasFactory,SoftDeletes;

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id')->withTrashed();
    }

    public function includeExclude()
    {
        return $this->belongsTo(IncludeExclude::class, 'include_exclude_id')->withTrashed();
    }    
    
}
