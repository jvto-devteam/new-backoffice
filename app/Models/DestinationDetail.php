<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DestinationDetail extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'destination_id',
        'topography',
        'ecosystems',
        'geological_features',
        'dry_season',
        'rainy_season',
        'temperature',
        'sunrise_timing',
        'rainfall_patterns',
        'footwear',
        'clothing',
        'waterproof_items',
        'lighting',
        'protection',
        'hydration',
        'trail_difficulty',
        'altitude_seckness_risk',
        'technical_sections',
        'preparations',
        'daily_trekking_hours',
        'health_check',
        'acclimatization',
    ];

    /**
     * Get the destination associated with this detail.
     */
    public function destination()
    {
        return $this->belongsTo(Destination::class, 'destination_id');
    }
}
