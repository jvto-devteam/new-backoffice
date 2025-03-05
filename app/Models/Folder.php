<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Folder extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'parent_id',
        'folder_type_id',
        'path',
        'is_system_folder',
    ];

    protected $casts = [
        'is_system_folder' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    public function folderType(): BelongsTo
    {
        return $this->belongsTo(FolderType::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(File::class);
    }

    public function getAllChildren()
    {
        $children = $this->children;

        foreach ($children as $child) {
            $children = $children->merge($child->getAllChildren());
        }

        return $children;
    }
}
