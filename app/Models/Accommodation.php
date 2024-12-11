<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Accommodation extends Model
{
    use HasFactory;

    protected $table = 'accommodations';
    protected $primaryKey = 'accommodation_id';
    protected $fillable = [
        'category_id',
        'accommodation_name',
    ];

    /**
     * Relation to accommodation category.
     */
    public function category()
    {
        return $this->belongsTo(AccommodationCategory::class, 'category_id');
    }

    /**
     * Relation to room types.
     */
    public function roomTypes()
    {
        return $this->hasMany(RoomType::class, 'accommodation_id');
    }
}
