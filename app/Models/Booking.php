<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Booking extends Model
{
    use HasFactory;
    protected $appends = ['book_add_on_total'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bookingDetail()
    {
        return $this->hasMany(BookingDetail::class, 'booking_id');
    }

    public function reviewGuide()
    {
        return $this->hasMany(ReviewGuide::class, 'booking_id');
    }

    public function guideDriver()
    {
        return $this->hasMany(BookGuideDriver::class,'booking_id');
    }

    public function bookCar()
    {
        return $this->hasMany(BookCar::class, 'booking_id');
    }

    public function bookRoom()
    {
        return $this->hasMany(BookRoomHotel::class, 'booking_id');
    }

    public function bookHotel()
    {
        return $this->hasMany(BookHotel::class, 'booking_id');
    }

    public function policeEscort()
    {
        return $this->hasMany(PoliceEscort::class, 'booking_id');
    }

    public function calculation()
    {
        return $this->hasMany(Calculation::class, 'booking_id');
    }

    public function bookItinerary()
    {
        return $this->hasMany(BookItinerary::class, 'booking_id');
    }

    public function bookService()
    {
        return $this->hasMany(BookService::class, 'booking_id');
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    public function bookingItinerary()
    {
        return $this->hasMany(BookingItinerary::class, 'booking_id');
    }

    public function bookJeep()
    {
        return $this->hasMany(BookJeep::class, 'booking_id');
    }

    public function waItinerary()
    {
        return $this->hasMany(WaItinerary::class, 'booking_id');
    }

    public function bookingDocument()
    {
        return $this->hasMany(BookingDocument::class, 'booking_id');
    }

    public function bookingCategory()
    {
        return $this->belongsTo(BookingCategory::class, 'booking_category_id');
    }

    public function bookAddOn()
    {
        return $this->hasMany(BookAddOn::class, 'booking_id');
    }

    public function getBookAddOnTotalAttribute()
    {
        return $this->bookAddOn()->sum(DB::raw('qty * price'));
    }

    public function bookingPayment()
    {
        return $this->hasMany(BookingPayment::class, 'booking_id');
    }

    public function gift()
    {
        return $this->hasOne(Discount::class, 'booking_id');
    }

    public function discountId()
    {
        return $this->belongsTo(Discount::class, 'discount_id');
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class, 'discount_id');
    }

    public function participant()
    {
        return $this->hasMany(Participant::class,'booking_id');
    }

    public function paymentMethodVendor()
    {
        return $this->belongsTo(PaymentMethod::class, 'is_vendor_paid_payment_method');
    }

    public function noteCategory()
    {
        return $this->belongsTo(NoteCategory::class, 'note_category_id');
    }

    public function bookingReview()
    {
        return $this->belongsTo(BookingReview::class, 'booking_id');
    }

    public function crewReview()
    {
        return $this->hasMany(CrewReview::class, 'booking_id');
    }
}
