<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = ['page_name', 'title', 'description', 'meta_title', 'meta_description', 'schema_markup', 'slug'];
}

