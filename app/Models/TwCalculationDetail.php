<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TwCalculationDetail extends Model
{
    use HasFactory;

    public function twCalculationCategory()
    {
        return $this->belongsTo(TwCalculationCategory::class, 'tw_calculation_category_id');
    }

    public function twCalculation()
    {
        return $this->belongsTo(TwCalculation::class, 'tw_calculation_id');
    }

    public function twCalculationItem()
    {
        return $this->belongsTo(TwCalculationItem::class, 'tw_calculation_item_id');
    }

    public function twCalculationItemDetail()
    {
        return $this->belongsTo(TwCalculationItemDetail::class, 'tw_calculation_item_detail_id');
    }

}
