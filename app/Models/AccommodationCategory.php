<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccommodationCategory extends Model
{
    use HasFactory;

    protected $table = 'accommodation_categories';

    protected $fillable = [
        'category_code',
        'category_name',
    ];

    /**
     * Relation to accommodations.
     */
    public function accommodations()
    {
        return $this->hasMany(Accommodation::class, 'category_id');
    }
}
