<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaChatCategory extends Model
{
    protected $fillable = ['name', 'description'];
    
    public function summaries()
    {
        return $this->hasMany(WaChatSummary::class, 'category_id');
    }
}