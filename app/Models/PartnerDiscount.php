<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PartnerDiscount extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'username', 'password'];

    public function discountCodes()
    {
        return $this->hasMany(PartnerDiscountCode::class);
    }
}
