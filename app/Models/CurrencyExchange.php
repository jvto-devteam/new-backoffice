<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CurrencyExchange extends Model
{
    use HasFactory;

    protected $table = 'currency_exchange';

    protected $fillable = ['currency_code', 'conversion_rates', 'created_at','updated_at'];
}
