<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComponentContent extends Model
{
    use HasFactory;

    protected $fillable = ['component_id', 'name', 'content', 'page_name'];

    // Relasi ke tabel components
    public function component()
    {
        return $this->belongsTo(Component::class);
    }
}

