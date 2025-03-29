<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'tags',
        'published_at',
        'status',
        'author',
        'featured_image',
        'meta_title',
        'meta_description',
    ];
    public function articleMedia()
    {
        return $this->hasMany(ArticleMedia::class, 'article_id');
    }
}
