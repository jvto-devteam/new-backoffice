<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Package extends Model
{
    use HasFactory, SoftDeletes;

    // Appending the 'min_price' and 'min_price_before_disc' attributes
    protected $appends = ['min_price', 'min_price_before_disc'];

    public function packageDestination()
    {
        return $this->hasMany(PackageDestination::class, 'package_id')->withTrashed();
    }

    public function packageBanner()
    {
        return $this->hasMany(PackageBanner::class, 'package_id')->withTrashed();
    }

    public function duration()
    {
        return $this->belongsTo(Duration::class, 'duration_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function itinerary()
    {
        return $this->hasMany(Itinerary::class, 'package_id');
    }

    public function packageIncludeExclude()
    {
        return $this->hasMany(PackageIncludeExclude::class, 'package_id')->withTrashed();
    }

    public function packagePrice()
    {
        return $this->hasMany(PackagePrice::class, 'package_id')
            ->where('price_plan_id', 2)
            ->orderBy('price', 'asc');
    }

    public function cart()
    {
        return $this->hasOne(Cart::class, 'package_id');
    }

    public function bookingDetail()
    {
        return $this->hasMany(BookingDetail::class, 'package_id');
    }

    public function itineraryDestination()
    {
        return $this->hasMany(ItineraryDestination::class, 'package_id');
    }

    public function startDestination()
    {
        return $this->belongsTo(Destination::class, 'start_destination_id');
    }

    public function endDestination()
    {
        return $this->belongsTo(Destination::class, 'end_destination_id');
    }

    public function packageActivity()
    {
        return $this->belongsTo(PackageActivity::class, 'package_activity_id');
    }

    public function packageActivitySingle()
    {
        return $this->hasOne(PackageActivity::class, 'package_id')->where('is_single','1');
    }

    public function experience()
    {
        return $this->belongsTo(Experience::class, 'experience_id');
    }

    public function packageHotel()
    {
        return $this->hasMany(PackageHotel::class, 'package_id');
    }

    // Get minimum price
    public function getMinPriceAttribute()
    {
        return $this->packagePrice()->min('price');
    }

    // Get min_price along with price_before_discount
    public function getMinPriceBeforeDiscAttribute()
    {
        $minPriceRecord = $this->packagePrice()->first(); // Get the record with the minimum price

        if ($minPriceRecord) {
            return $minPriceRecord->price_before_disc;
        }

        return null;
    }
}
