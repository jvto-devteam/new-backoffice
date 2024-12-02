<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FaqSubcategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'faq_category_id'];

    public function category()
    {
        return $this->belongsTo(FaqCategory::class,'faq_category_id');
    }

    public function faqs()
    {
        return $this->hasMany(Faq::class);
    }
}
