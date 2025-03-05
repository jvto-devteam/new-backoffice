<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FileType extends Model
{
    use HasFactory;

    protected $fillable = [
        'extension',
        'icon_name',
        'icon_color',
    ];

    public function files(): HasMany
    {
        return $this->hasMany(File::class);
    }
}
