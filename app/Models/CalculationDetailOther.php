<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalculationDetailOther extends Model
{
    use HasFactory;
    public function itemCalculation()
    {
        return $this->belongsTo(ItemCalculation::class, 'item_id');
    }
    public function itemCalculationOther()
    {
        return $this->belongsTo(ItemCalculationOther::class, 'item_id');
    }
}
