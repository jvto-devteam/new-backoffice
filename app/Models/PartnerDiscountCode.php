<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PartnerDiscountCode extends Model
{
    use HasFactory;

    protected $fillable = ['partner_discount_id', 'discount_id'];

    public function partnerDiscount()
    {
        return $this->belongsTo(PartnerDiscount::class);
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class);
    }
}
