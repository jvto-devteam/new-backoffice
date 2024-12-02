<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Calculation extends Model
{
    use HasFactory;

    public function calculationDetailOther()
    {
        return $this->hasMany(CalculationDetailOther::class, 'calculation_id');
    }

}
