<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleMedia extends Model
{
    use HasFactory;

    protected $table = 'article_media';

    public function article()
    {
        return $this->belongsTo(Article::class, 'article_id');
    }
}
