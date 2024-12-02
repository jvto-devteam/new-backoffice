<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemCalculation extends Model
{
    use HasFactory;

    public function itemCalculation()
    {
        return $this->hasOne(CalculationDetail::class, 'item_id');
    }

}
