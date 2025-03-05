<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FolderType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'icon_name',
        'icon_color',
    ];

    public function folders(): HasMany
    {
        return $this->hasMany(Folder::class);
    }
}
