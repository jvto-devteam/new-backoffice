<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingPayment;
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
        $firstDayMonth = date('Y-m-01');
        $lastDayMonth = date('Y-m-t');
        $today = date('Y-m-d');
        $todayPlus7 = date('Y-m-d',strtotime(date('Y-m-d')." +7 days"));


        $alert['no_pickup'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
        ->where(function ($query) {
            $query->whereNull('pickup');
        })
        ->where('status','booked')
        ->orderBy('travel_date_start','asc')->get();                                            
        $alert['no_drop'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
        ->where(function ($query) {
            $query->whereNull('drop');
        })
        ->where('status','booked')
        ->orderBy('travel_date_start','asc')->get();                                            
        $alert['no_car'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
            ->whereDoesntHave('bookCar')
            ->where('status','booked')
            ->orderBy('travel_date_start','asc')->get();
        $alert['no_crew'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start','>=',$today)->where('travel_date_start','<=',$lastDayMonth)
        ->whereDoesntHave('guideDriver')
        ->where('status','booked')
        ->orderBy('travel_date_start','asc')->get();
        $alert['no_payment_method'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
        ->whereNull('outstanding_payment_method')
        ->where('status','booked')
        ->where('agent_id',2)
        ->where('booking_category_id','!=',3)
        ->orderBy('travel_date_start','asc')->get();
        $alert['no_hotel'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
        ->whereDoesntHave('bookHotel')
        ->where('status','booked')
        ->orderBy('travel_date_start','asc')->get();
        $alert['no_tshirt'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
        ->whereHas('bookingDetail', function ($query) {
            $query->whereRaw(
                'bookings.total_pax != (xss + xxs + xs + s + m + l + xl + xxl + xxxl)'
            );
        })
        ->where('status','booked')
        ->orderBy('travel_date_start','asc')->get();
        $alert['no_trip_media'] = Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$lastDayMonth)
            ->whereNull('media_link')
            ->where('status','booked')
            ->orderBy('travel_date_start','asc')->get();

        $upcoming = Booking::select('bookings.id','package_duration','travel_date_start','users.name','total_pax','bookings.agent_id','bookings.booking_category_id')->with('guideDriver.person')->join('users','bookings.user_id','users.id')->where('travel_date_start', '>=', $today)->where('travel_date_start','<=',$todayPlus7)
            ->where('status','booked')
            ->orderBy('travel_date_start','asc')
            ->get()->map(function($data){
                $night = $data->package_duration - 1;
                if($data->agent_id === 1){
                    $order_channel = 'TWT';
                }
                else{
                    if($data->booking_category_id === 3){
                        $order_channel = 'KLOOK';
                    }
                    else{
                        $order_channel = 'JVTO';
                    }
                }
                // return $data;
                return [
                    'id' => $data->id,
                    'user' => $data->name,
                    'package' => $data->package_duration."D ".$night."N Package",
                    'date' => $data->travel_date_start,
                    'total_pax' => $data->total_pax,
                    'order_channel' => $order_channel,
                    'crews' => $data->guideDriver->map(function($crew){
                        return [
                            'name' => $crew->person->name,
                            'type' => $crew->type,
                            'is_ijen' => $crew->guide_ijen,
                        ];
                    })
                ];
            });
        // return $data['upcoming'];

        return Inertia::render('Dashboard',['alertData' => $alert,'upcoming' => $upcoming]);
    }
    function portalVendor(){
        return Inertia::render('PortalVendor');
    }
    function generateInv(){
        // $new = new BookingPayment;
        // $new->booking_id = 981;
        // $new->nominal = 1500000;
        // $new->payment_method_id = 7;    
        // $new->description = 'Down Payment';
        // $new->is_paid = '0';
        // $new->save();
        
        $booking = Booking::with(['user','bookingPayment' => function ($query) {
            $query->withoutGlobalScope('paid');
        }])->where('agent_id',2)->where('booking_category_id','!=',3)->where('travel_date_start','>=',date('Y-m-01'))->orderBy('travel_date_start','asc')->get()->map(function($booking){
            if(count($booking->bookingPayment) == 0){
                $new = new BookingPayment;
                $new->booking_id = $booking->id;
                $new->nominal = $booking->dp;
                if($booking->payment_method == 'cc'){
                    $new->payment_method_id = 3;    
                }
                else if($booking->payment_method == 'wise'){
                    $new->payment_method_id = 5;    
                }
                else if($booking->payment_method == 'pay later'){
                    $new->payment_method_id = 7;    
                }
                $new->description = 'Down Payment';
                $new->reference = $booking->payment_link;
                $new->is_paid = '0';
                $new->save();
            }
            return [
                'id' => $booking->id,
                'user' => $booking->user->name,
                'travel_date_start' => $booking->travel_date_start,
                'status' => $booking->status,
                'dp' => $booking->dp,
                'payment_method' => $booking->payment_method,
                'payment_link' => $booking->payment_link,
                'payment' => $booking->bookingPayment,
            ];
        });

        \DB::table('booking_payments')->where('is_paid','1')->update([
            'paid_at' => \DB::raw('created_at')
        ]);

        return $booking;
    }
}
