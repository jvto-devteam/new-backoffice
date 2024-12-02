<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TwCalculationItemDetail extends Model
{
    use HasFactory;

    public function posTransfer()
    {
        return $this->belongsTo(PosTransfer::class, 'pos_transfer_id');
    }

    public function twCalculationItem()
    {
        return $this->belongsTo(TwCalculationItem::class, 'tw_calculation_item_id');
    }

}
