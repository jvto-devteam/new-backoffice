<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'background',
        'icon',
    ];

    public function packages()
    {
        return $this->hasMany(Package::class);
    }
}
