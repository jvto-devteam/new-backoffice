<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TwCalculationCategory extends Model
{
    use HasFactory;

    public function twCalculationItem()
    {
        return $this->hasMany(TwCalculationItem::class, 'tw_calculation_category_id');
    }
}
