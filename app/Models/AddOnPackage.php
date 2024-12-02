<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AddOnPackage extends Model
{
    use HasFactory,SoftDeletes;

    public function addOn()
    {
        return $this->belongsTo(AddOn::class, 'add_on_id');
    }
}
