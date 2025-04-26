<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class GuideDriver extends Model
{
    use HasFactory, SoftDeletes, HasApiTokens;
    protected $hidden = [
        'password',
        'device_token',
    ];
    public function bookGuideDriver()
    {
        return $this->hasMany(BookGuideDriver::class, 'guide_id');
    }
    public function crewReview()
    {
        return $this->hasMany(CrewReview::class, 'crew_id');
    }

}
