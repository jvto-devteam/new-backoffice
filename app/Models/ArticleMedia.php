<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id',
        'media_url',
        'caption',
        'alt_text',
        'type',
    ];

    protected $table = 'article_media';

    public function article()
    {
        return $this->belongsTo(Article::class, 'article_id');
    }
}
