<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    function index(){
        // $lastMonth = date('Y-m',strtotime(date('Y-m')." -1 month"));
        // $data['total_booking'] = Booking::where('travel_date_start','like','%'.date('Y-m').'%')->where('status','booked')->count();
        // $data['total_booking_last_month'] = Booking::where('travel_date_start','like','%'.$lastMonth.'%')->where('status','booked')->count();
        // $data['change_total_boking'] = $data['total_booking'] - $data['total_booking_last_month'];

        // $data['total_booking_complete'] = Booking::where('travel_date_start','like','%'.date('Y-m').'%')->where('travel_date_end','<',date('Y-m-d'))->where('status','booked')->count();
        // $data['total_booking_on_going'] = Booking::where('travel_date_start','like','%'.date('Y-m').'%')->where('travel_date_start','<=',date('Y-m-d'))->where('travel_date_end','>=',date('Y-m-d'))->where('status','booked')->count();

        // $data['booking'] = Booking::with(['bookingPayment.paymentMethod','bookingCategory', 'user.country','user.discount', 'agent', 'bookingDetail.package.duration', 'bookCar.car.garage', 'guideDriver.person', 'bookingItinerary.bookHotel.hotel', 'bookingItinerary.bookHotel.bookRoom.roomHotel.hotel.area','bookingItinerary.activityStart.destination'])->where('travel_date_start', '>=',date('Y-m-d'))->where('status', 'booked')->orderBy('travel_date_start','asc')->limit(5)->get();

        // $data['booking_today'] = Booking::with(['bookingPayment.paymentMethod','bookingCategory', 'user.country','user.discount', 'agent', 'bookingDetail.package.duration', 'bookCar.car.garage', 'guideDriver.person', 'bookingItinerary.bookHotel.hotel', 'bookingItinerary.bookHotel.bookRoom.roomHotel.hotel.area','bookingItinerary.activityStart.destination'])->where('travel_date_start', '>=',date('Y-m-d'))
        // ->where('travel_date_end', '<=',date('Y-m-d'))
        // ->where('status', 'booked')->orderBy('travel_date_start','asc')->limit(5)->get();

        // $data['user'] = User::with(['booking' => function($query){
        //     $query->where('status','booked');
        // }])->count();
        $today = date('Y-04-01');


        $data['no_pickup'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-04-t'))
        ->where(function ($query) {
            $query->whereNull('pickup');
        })
        ->where('status','booked')
        ->get();                                            
        $data['no_drop'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-04-t'))
        ->where(function ($query) {
            $query->whereNull('drop');
        })
        ->where('status','booked')
        ->get();                                            
        $data['no_car'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-04-t'))
            ->whereDoesntHave('bookCar')
            ->where('status','booked')
            ->get();
        $data['no_crew'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name')->join('users','bookings.user_id','users.id')->where('travel_date_start','>=',$today)->where('travel_date_start','<=',date('Y-04-t'))
        ->whereDoesntHave('guideDriver')
        ->where('status','booked')
        ->get();
        $data['no_payment_method'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-04-t'))
        ->whereNull('outstanding_payment_method')
        ->where('status','booked')
        ->where('agent_id',2)
        ->where('booking_category_id','!=',3)
        ->get();
        $data['no_hotel'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-04-t'))
        ->whereDoesntHave('bookHotel')
        ->where('status','booked')
        ->get();
        $data['no_tshirt'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-04-t'))
        ->whereHas('bookingDetail', function ($query) {
            $query->whereRaw(
                'bookings.total_pax != (xss + xxs + xs + s + m + l + xl + xxl + xxxl)'
            );
        })
        ->where('status','booked')
        ->get();
        $data['no_trip_media'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-04-t'))
            ->whereNull('media_link')
            ->where('status','booked')
            ->get();                                       
        // return $data;

        return Inertia::render('Dashboard',['data' => $data]);
    }
}
