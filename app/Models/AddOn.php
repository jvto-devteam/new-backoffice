<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AddOn extends Model
{
    use HasFactory;
    protected $fillable = [
        'add_on',
        'price',
        'is_transport',
        'type_transport',
        'transport_price',
    ];
}
