<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarConfiguration extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'car_id',
        'pax',
        'price',
        'crew_jvto_role_id',
        'crew_twt_role_id',
        'crew_klook_role_id',
    ];

    /**
     * Get the car associated with this configuration.
     */
    public function car()
    {
        return $this->belongsTo(Car::class, 'car_id');
    }

    /**
     * Get the JVTO crew role associated with this configuration.
     */
    public function crewJvtoRole()
    {
        return $this->belongsTo(CrewRole::class, 'crew_jvto_role_id');
    }

    /**
     * Get the TwT crew role associated with this configuration.
     */
    public function crewTwtRole()
    {
        return $this->belongsTo(CrewRole::class, 'crew_twt_role_id');
    }

    /**
     * Get the Klook crew role associated with this configuration.
     */
    public function crewKlookRole()
    {
        return $this->belongsTo(CrewRole::class, 'crew_klook_role_id');
    }
    public function crewRole()
    {
        return $this->belongsTo(CrewRole::class, 'crew_jvto_role_id');
    }

}
