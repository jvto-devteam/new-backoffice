<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IncludeExclude extends Model
{
    use HasFactory,SoftDeletes;

    public function packageIncludeExclude()
    {
        return $this->hasOne(PackageIncludeExclude::class, 'include_exclude_id')->withTrashed();
    }

}
