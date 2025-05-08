<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WaChat extends Model
{
    use HasFactory;

    protected $table = 'wa_chats';

    protected $fillable = [
        'user_id',
        'message',
        'is_from_me',
        'date_time',
        'has_media',
        'media_mime',
    ];

    protected $casts = [
        'is_from_me' => 'boolean',
        'has_media' => 'boolean',
        'date_time' => 'datetime',
    ];

    // Relasi ke user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
