<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaChatSummary extends Model
{
    protected $fillable = ['user_id', 'date', 'summary', 'category_id', 'chat_count'];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function category()
    {
        return $this->belongsTo(WaChatCategory::class, 'category_id');
    }
}
