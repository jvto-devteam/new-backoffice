<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    use HasFactory;

    protected $fillable = ['faq_category_id', 'faq_subcategory_id', 'question', 'answer'];

    public function category()
    {
        return $this->belongsTo(FaqCategory::class,'faq_category_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(FaqSubcategory::class,'faq_subcategory_id');
    }
}
