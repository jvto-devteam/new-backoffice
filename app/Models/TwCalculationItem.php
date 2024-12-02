<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TwCalculationItem extends Model
{
    use HasFactory;

    public function twCalculationItemDetail()
    {
        return $this->hasMany(TwCalculationItemDetail::class, 'tw_calculation_item_id')->orderBy('no');
    }

    public function twCalculationCategory()
    {
        return $this->belongsTo(TwCalculationCategory::class, 'tw_calculation_category_id');
    }

}
