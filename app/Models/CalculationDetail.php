<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalculationDetail extends Model
{
    use HasFactory;
    public function itemCalculation()
    {
        return $this->belongsTo(ItemCalculation::class, 'item_id');
    }
}
