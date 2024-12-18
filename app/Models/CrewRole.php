<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrewRole extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'crew_role_code',
        'order_channel_id',
        'role',
        'unit',
        'formula',
        'rate',
    ];

    /**
     * Get the order channel associated with this crew role.
     */
    public function orderChannel()
    {
        return $this->belongsTo(OrderChannel::class, 'order_channel_id');
    }
}
