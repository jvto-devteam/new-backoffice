<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    function index(){
        $lastMonth = date('Y-m',strtotime(date('Y-m')." -1 month"));
        $data['total_booking'] = Booking::where('travel_date_start','like','%'.date('Y-m').'%')->where('status','booked')->count();
        $data['total_booking_last_month'] = Booking::where('travel_date_start','like','%'.$lastMonth.'%')->where('status','booked')->count();
        $data['change_total_boking'] = $data['total_booking'] - $data['total_booking_last_month'];

        $data['total_booking_complete'] = Booking::where('travel_date_start','like','%'.date('Y-m').'%')->where('travel_date_end','<',date('Y-m-d'))->where('status','booked')->count();
        $data['total_booking_on_going'] = Booking::where('travel_date_start','like','%'.date('Y-m').'%')->where('travel_date_start','<=',date('Y-m-d'))->where('travel_date_end','>=',date('Y-m-d'))->where('status','booked')->count();

        $data['booking'] = Booking::with(['bookingPayment.paymentMethod','bookingCategory', 'user.country','user.discount', 'agent', 'bookingDetail.package.duration', 'bookCar.car.garage', 'guideDriver.person', 'bookingItinerary.bookHotel.hotel', 'bookingItinerary.bookHotel.bookRoom.roomHotel.hotel.area','bookingItinerary.activityStart.destination'])->where('travel_date_start', '>=',date('Y-m-d'))->where('status', 'booked')->orderBy('travel_date_start','asc')->limit(5)->get();

        $data['user'] = User::with(['booking' => function($query){
            $query->where('status','booked');
        }])->count();
        $today = date('Y-m-d');
        $data['no_crew'] = Booking::where('travel_date_start','>=',$today)->where('travel_date_start','<=',date('Y-m-t'))
        ->whereDoesntHave('guideDriver')
        ->where('status','booked')
        ->count();

        $data['no_car'] = Booking::where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-m-t'))
            ->whereDoesntHave('bookCar')
            ->where('status','booked')
            ->count();
        $data['no_trip_media'] = Booking::where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-m-t'))
            ->whereNotNull('media_link')
            ->where('status','booked')
            ->count();                                           
        $data['no_pickup_drop'] = Booking::where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-m-t'))
        ->where(function ($query) {
            $query->whereNull('pickup')
                ->orWhereNull('drop');
        })
        ->where('status','booked')
        ->count();                                            
        $data['no_tshirt'] = Booking::where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-m-t'))
        ->whereHas('bookingDetail', function ($query) {
            $query->whereRaw(
                'bookings.total_pax != (xss + xxs + xs + s + m + l + xl + xxl + xxxl)'
            );
        })
        ->where('status','booked')
        ->count();
        $data['no_expense'] = Booking::where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-m-t'))
            ->whereNotNull('expense_file_internal')
            ->where('status','booked')
            ->count();
        $data['no_hotel'] = Booking::where('travel_date_start', '>=', $today)->where('travel_date_start','<=',date('Y-m-t'))
        ->whereDoesntHave('bookHotel')
        ->where('status','booked')
        ->count();



        return Inertia::render('Dashboard2',['data' => $data]);
    }
}
