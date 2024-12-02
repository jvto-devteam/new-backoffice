<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory,SoftDeletes;

    protected $table = "countries";

    public function user()
    {
        return $this->hasOne(Users::class, 'country_id');
    }

}
