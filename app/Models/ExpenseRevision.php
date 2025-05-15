<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExpenseRevision extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'item_id',
        'item_id_source',
        'qty',
        'item',
        'price_before',
        'price_after',
        'total',
        'status',
        'reason',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Optional: Dynamic relation to the item source
     * You can load the source dynamically if needed.
     */
    public function itemSource()
    {
        if (!$this->item_id_source || !$this->item_id) {
            return null;
        }

        $modelMap = [
            'book_room_hotels' => \App\Models\BookRoomHotel::class,
            'book_hotel_meals' => \App\Models\BookHotelMeal::class,
            'book_destination_activities' => \App\Models\BookDestinationActivity::class,
            'book_others_activities' => \App\Models\BookOthersActivity::class,
            'book_car_activities' => \App\Models\BookCarActivity::class,
            'book_crew_activities' => \App\Models\BookCrewActivity::class,
        ];

        $model = $modelMap[$this->item_id_source] ?? null;

        return $model ? $model::find($this->item_id) : null;
    }
}
