<?php

namespace App\Http\Controllers;

use App\Models\BookCarActivity;
use App\Models\BookCrewActivity;
use App\Models\BookDestinationActivity;
use App\Models\BookHotel;
use App\Models\BookHotelMeal;
use App\Models\Booking;
use App\Models\BookOthersActivity;
use App\Models\BookRoomHotel;
use App\Models\Car;
use App\Models\CarConfiguration;
use App\Models\CrewRole;
use App\Models\DestinationActivity;
use App\Models\Itinerary;
use App\Models\OthersActivity;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    function invoice(Request $request){
        $search = $request->input('search');
        $startDate = $request->get('start_date') ? $request->get('start_date') : date('Y-m-01');
        $endDate = $request->get('end_date') ? $request->get('end_date') : date('Y-m-t');
        $package = $request->input('package');
        $channel = $request->input('channel');
        $perPage = 10;
        $query = Booking::select('id','user_id','total_pax','travel_date_start','grand_total','payment','balance','booking_category_id')->with(['user.country','bookingDetail' => function($q){
            $q->select('id','package_id','booking_id')->with('package',function($qq){
                $qq->select('id','name','package_code');
            });
        },'bookingPayment.paymentMethod','bookAddOn.addOn'])->where('status', 'booked')->where('agent_id', 2)->where('booking_category_id','!=','3')->orderBy('travel_date_start','asc');
        if ($search) {
            $query->whereHas('user',function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($startDate && $endDate) {
            $query->whereBetween('travel_date_start', [$startDate, $endDate]);
        }
    
        // Apply package filter
        if ($package) {
            $query->whereHas('bookingDetail', function($q) use ($package) {
                $q->where('package_id', $package);
            });
        }
        // Apply channel filter
        if ($channel) {
            if($channel == 'klook'){
                $query->where('booking_category_id',3);
            }
            else{
                $query->where('booking_category_id','!=',3);
            }
        }

        $bookings = $query->get();
        $summary = [
            'bookings' => $bookings->count(),
            'grand_total' => $bookings->sum('grand_total')+$bookings->sum('book_add_on_total'),
            'paxs' => $bookings->sum('total_pax'),
            'paid' => $bookings->filter(function($booking) {
                return $booking->booking_category_id != 3 && $booking->balance <= 0;
            })->count(),
            'dp_paid' => $bookings->filter(function($booking) {
                return $booking->booking_category_id != 3 && $booking->payment > 0 && $booking->balance > 0;
            })->count(),
            'unpaid' => $bookings->filter(function($booking) {
                return $booking->booking_category_id != 3 && $booking->payment == 0;
            })->count(),            
        ];
       
        $booking = $query->paginate($perPage)
            ->through(function($booking) {
                return [
                    'id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'name' => $booking->user->name,
                    'channel' => $booking->booking_category_id == 3 ? 'KLOOK' : 'JVTO',
                    'package_code' => $booking->bookingDetail[0]->package->package_code,
                    'package' => $booking->bookingDetail[0]->package->name ?? '-',
                    'numb_of_pax' => $booking->total_pax ?? 0,
                    'trip_date' => $booking->travel_date_start ?? '-',
                    'total_per_pax' => $booking->grand_total/$booking->total_pax,
                    'total' => $booking->grand_total,
                    'total_add_on' => $booking->book_add_on_total,
                    'grand_total' => $booking->grand_total+$booking->book_add_on_total,
                    'payment' => $booking->payment,
                    'balance' => $booking->balance,
                    'payment_status' => $booking->payment == 0 ? 'Unpaid' : ($booking->balance <= 0 ? 'Paid' : 'DP Paid'),
                    'booking_payment' => $booking->bookingPayment,
                    'add_on' => $booking->bookAddOn,
                ];
            });
        $packages = Package::where('is_publish','1')->orWhere('package_platform','klook')->orderBy('package_code')->get(['id','package_code','name']);

        $filters = $request->only(['search','package','channel']);
        $filters['start_date'] = $startDate;
        $filters['end_date'] = $endDate;

        return Inertia::render('Finance/InvoiceManager', [
            'booking' => $booking,
            'summary' => $summary,
            'packages' => $packages,
            'filters' => $filters,
        ]);
    }

    function expense(Request $request){
        $search = $request->input('search');
        $startDate = $request->get('start_date') ? $request->get('start_date') : date('Y-m-01');
        $endDate = $request->get('end_date') ? $request->get('end_date') : date('Y-m-t');
        $package = $request->input('package');
        $channel = $request->input('channel');
        $perPage = 10;
        $query = Booking::select('id','user_id','total_pax','travel_date_start','grand_total','payment','expense_internal_total')->with(['user.country','bookingDetail' => function($q){
            $q->select('id','package_id','booking_id')->with('package',function($qq){
                $qq->select('id','name','package_code');
            });
        }])->where('status', 'booked')->where('agent_id', 2)->where('travel_date_start','like','%2025%')->orderBy('travel_date_start','asc');
        if ($search) {
            $query->whereHas('user',function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($startDate && $endDate) {
            $query->whereBetween('travel_date_start', [$startDate, $endDate]);
        }
    
        // Apply package filter
        if ($package) {
            $query->whereHas('bookingDetail', function($q) use ($package) {
                $q->where('package_id', $package);
            });
        }
        // Apply channel filter
        if ($channel) {
            if($channel == 'klook'){
                $query->where('booking_category_id',3);
            }
            else{
                $query->where('booking_category_id','!=',3);
            }
        }

        $bookings = $query->get();
        // Total Booking, Total Expense, Total Paid, Total Unpaid 
        $summary = [
            'bookings' => $query->count(),
            'total_expense' => $query->sum('expense_internal_total'),
            'paid' => 1000000,
            'unpaid' => 2000000,            
        ];
       
        $booking = $query->paginate($perPage)
            ->through(function($booking) {
                return [
                    'id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'name' => $booking->user->name,
                    'package_code' => $booking->bookingDetail[0]->package->package_code,
                    'package' => $booking->bookingDetail[0]->package->name ?? '-',
                    'numb_of_pax' => $booking->total_pax ?? 0,
                    'trip_date' => $booking->travel_date_start ?? '-',
                    'total_per_pax' => $booking->grand_total/$booking->total_pax,
                    'total' => $booking->grand_total,
                    'expense' => $booking->expense_internal_total,
                    'total_add_on' => $booking->book_add_on_total,
                    'grand_total' => $booking->grand_total+$booking->book_add_on_total,
                    'payment' => $booking->payment,
                    'balance' => ($booking->grand_total+$booking->book_add_on_total)-$booking->payment,
                    'payment_status' => $booking->payment == 0 ? 'Unpaid' : (($booking->grand_total+$booking->book_add_on_total)-$booking->payment == 0 ? 'Paid' : 'DP Paid'),
                ];
            });
        $packages = Package::where('is_publish','1')->orWhere('package_platform','klook')->orderBy('package_code')->get(['id','package_code','name']);
        $filters = $request->only(['search','package','channel']);
        $filters['start_date'] = $startDate;
        $filters['end_date'] = $endDate;
        return Inertia::render('Finance/ExpenseManager', [
            'booking' => $booking,
            'summary' => $summary,
            'packages' => $packages,
            'filters' => $filters,
        ]);
    }
    function editExpense($id){
        $booking = Booking::select('id','user_id','total_pax','travel_date_start','grand_total','agent_id','booking_category_id')->with(['user' => function($query){
            $query->select('id','name');
        },'bookingDetail' => function($query){
            $query->select('id','package_id','booking_id')->with(['package' => function($q){
                $q->select('id','name','duration_id')->with('duration');
            }]);
        }])->where('id',$id)->first();
        $pax = $booking->total_pax;
        $day = $booking->bookingDetail[0]->package->duration->day;

        $bookRoom = BookHotel::select('id','booking_id','hotel_id','b','l','d','is_paid','is_debt')->with(['hotel' => function($query){
            $query->select('id','name','lunch_rate','dinner_rate');
        },'bookRoom' => function($query){
            $query->select('id','book_hotel_id','room_hotel_id','quantity','subtotal')->with(['roomHotel' => function($q){
                $q->select('id','room_name','rate');
            }]);
        },'bookHotelMeal'])->where('booking_id',$id)
        ->get()
        ->map(function($booking) use($pax) {
            if($booking->l == '1'){
                $cekBookHotelMeals = BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','lunch')->first();
                if(!$cekBookHotelMeals){
                    $breakfast = new BookHotelMeal;
                    $breakfast->book_hotel_id = $booking->id;
                    $breakfast->booking_id = $booking->booking_id;
                    $breakfast->hotel_id = $booking->hotel_id;
                    $breakfast->meals = 'lunch';
                    $breakfast->qty = $pax;
                    $breakfast->price = $booking->hotel->lunch_rate;
                    $breakfast->subtotal = $pax*$booking->hotel->lunch_rate;
                    $breakfast->save();
                }
            }
            else{
                BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','lunch')->delete();
            }
            if($booking->d == '1'){
                $cekBookHotelMeals = BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','dinner')->first();
                if(!$cekBookHotelMeals){
                    $breakfast = new BookHotelMeal;
                    $breakfast->book_hotel_id = $booking->id;
                    $breakfast->booking_id = $booking->booking_id;
                    $breakfast->hotel_id = $booking->hotel_id;
                    $breakfast->meals = 'dinner';
                    $breakfast->qty = $pax;
                    $breakfast->price = $booking->hotel->dinner_rate;
                    $breakfast->subtotal = $pax*$booking->hotel->dinner_rate;
                    $breakfast->save();
                }
            }
            else{
                BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','dinner')->delete();
            }

            $booking->bookRoom->map(function($room) {
                if ($room->subtotal === null) {
                    $room->subtotal = $room->roomHotel->rate * $room->quantity;
                    $room->save();
                }
                return $room;
            });
            return $booking;
        });

        if($booking->agent_id == 1){
            $channel = 'twt';
        }
        else if($booking->agent_id == 2){
            if($booking->booking_category_id == 3){
                $channel = 'klook';
            }
            else{
                $channel = 'jvto';
            }
        }

        $cekDestinations = BookDestinationActivity::where('booking_id',$id)->count();
        $cekOthers = BookOthersActivity::where('booking_id',$id)->count();
        $packageId = $booking->bookingDetail[0]->package_id;
        $agentId = $booking->agent_id;
        $bookinCategoryId = $booking->booking_category_id;
        
        if($cekDestinations == 0){
            $getDestinationActivities = Itinerary::with(['itineraryDestination.destination.activity' => function($query) use($agentId,$bookinCategoryId){
                if($agentId == 1){
                    $query->where('is_default_twt','1');
                }
                else if($agentId == 2){
                    if($bookinCategoryId == 3){
                        $query->where('is_default_klook','1');
                    }
                    else{
                        $query->where('is_default_jvto','1');
                    }
                }
            },'itineraryDestination.secondDestination.activity' =>  function($query) use($agentId,$bookinCategoryId){
                if($agentId == 1){
                    $query->where('is_default_twt','1');
                }
                else if($agentId == 2){
                    if($bookinCategoryId == 3){
                        $query->where('is_default_klook','1');
                    }
                    else{
                        $query->where('is_default_jvto','1');
                    }
                }

            }])->where('package_id',$packageId)->get()->map(function($itinerary) use($pax,$day,$id){
                if(!empty($itinerary->itineraryDestination->destination->activity)){
                    $itinerary->itineraryDestination->destination->activity->map(function($activity) use($itinerary,$pax,$day,$id){
                        $formula = str_replace(
                            ['pax', 'day', 'Math.ceil'],
                            ['$pax', '$day', 'ceil'],
                            $activity->formula
                        );                        
                        $resultFormula = eval('return ' . $formula . ';');
                        $bookDestinationActivity = new BookDestinationActivity;
                        $bookDestinationActivity->booking_id = $id;
                        $bookDestinationActivity->destination_id = $activity->destination_id;
                        $bookDestinationActivity->destination_activity_id = $activity->id;
                        $bookDestinationActivity->qty = $resultFormula;
                        $bookDestinationActivity->price = $activity->price;
                        $bookDestinationActivity->subtotal = $bookDestinationActivity->qty*$activity->price;
                        $bookDestinationActivity->status_paid = "unpaid";
                        $bookDestinationActivity->is_debt = "0";
                        $bookDestinationActivity->save();
                    });
                }
                if(!empty($itinerary->itineraryDestination->secondDestination->activity)){
                    $itinerary->itineraryDestination->secondDestination->activity->map(function($activity) use($itinerary,$pax,$day,$id){
                        $formula = str_replace(
                            ['pax', 'day', 'Math.ceil'],
                            ['$pax', '$day', 'ceil'],
                            $activity->formula
                        );                        
                        $resultFormula = eval('return ' . $formula . ';');
                        $bookDestinationActivity = new BookDestinationActivity;
                        $bookDestinationActivity->booking_id = $id;
                        $bookDestinationActivity->destination_id = $activity->destination_id;
                        $bookDestinationActivity->destination_activity_id = $activity->id;
                        $bookDestinationActivity->qty = $resultFormula;
                        $bookDestinationActivity->price = $activity->price;
                        $bookDestinationActivity->subtotal = $bookDestinationActivity->qty*$activity->price;
                        $bookDestinationActivity->status_paid = "unpaid";
                        $bookDestinationActivity->is_debt = "0";
                        $bookDestinationActivity->save();
                    });

                }
            });
        }
        $destinations = BookDestinationActivity::select('id','destination_id','destination_activity_id','qty','price','subtotal','status_paid','is_debt')->with(['destination' => function($query){
            $query->select('id','name');
        },'destinationActivity' => function($query){
            $query->select('id','name','unit');
        }])->where('booking_id',$id)->get()->groupBy(fn($item) => $item->destination->name);

        if($cekOthers == 0){
            $getOthers = OthersActivity::where('is_default','1')->get()->map(function($others) use($id,$pax,$day){
                $insertOthers = new BookOthersActivity;
                $insertOthers->booking_id = $id;
                $insertOthers->others_activity_id = $others->id;
                
                $formula = str_replace(
                    ['pax', 'day', 'Math.ceil'],
                    ['$pax', '$day', 'ceil'],
                    $others->formula
                );                        
                $resultFormula = eval('return ' . $formula . ';');
                
                $insertOthers->qty = $resultFormula;
                $insertOthers->price = $others->price;
                $insertOthers->subtotal = $insertOthers->qty*$others->price;
                $insertOthers->status_paid = 'unpaid';
                $insertOthers->save();
            });
        }

        $others = BookOthersActivity::with('othersActivity')->where('booking_id',$id)->get();

        $cekCar = CarConfiguration::with(['crewJvtoRole','crewTwtRole','crewKlookRole'])->where('pax',$pax);
        $isCarExist = false;
        if($booking->agent_id == 1){
            $cekCar = $cekCar->whereNotNull('crew_twt_role_id');
            $isCarExist = true;
        }
        else if($booking->agent_id == 2){
            $isCarExist = true;
            if($booking->booking_category_id == 3){
                $cekCar = $cekCar->whereNotNull('crew_klook_role_id');
            }
            else{
                $cekCar = $cekCar->whereNotNull('crew_jvto_role_id');
            }
        }

        if($isCarExist){
            $cekCar = $cekCar->first();

            $cekCarActivities = BookCarActivity::where('booking_id',$id)->count();
            if($cekCarActivities == 0){
                $insertCar = new BookCarActivity;
                $insertCar->booking_id = $id;
                $insertCar->car_id = $cekCar->car_id;
                $insertCar->qty = $day;
                $insertCar->price = $cekCar->price;
                $insertCar->subtotal = $insertCar->qty*$insertCar->price;
                $insertCar->status_paid = 'unpaid';
                $insertCar->save();
            }

            $cekCrewActivities = BookCrewActivity::where('booking_id',$id)->count();
            if($cekCrewActivities == 0){
                $insertCrew = new BookCrewActivity;
                $insertCrew->booking_id = $id;
                
                if($booking->agent_id == 1){
                    $crew_role_id = $cekCar->crew_twt_role_id;
                    $crew_price = $cekCar->crewTwtRole->rate;
                }
                else if($booking->agent_id == 2){
                    if($booking->booking_category_id == 3){
                        $crew_role_id = $cekCar->crew_klook_role_id;
                        $crew_price = $cekCar->crewKlookRole->rate;
                    }
                    else{
                        $crew_role_id = $cekCar->crew_jvto_role_id;
                        $crew_price = $cekCar->crewJvtoRole->rate;
                    }
                }
                $insertCrew->crew_role_id = $crew_role_id;
                $insertCrew->qty = $day;
                $insertCrew->price = $crew_price;

                $insertCrew->subtotal = $insertCrew->qty*$insertCrew->price;
                $insertCrew->status_paid = 'unpaid';
                $insertCrew->save();
            }
        }
        $resources['cars'] = BookCarActivity::with(['car' => function($query){
            $query->select('id','name');
        }])->where('booking_id',$id)->get();
        $resources['crews'] = BookCrewActivity::with(['crewRole' => function($query){
            $query->select('id','role');
        }])->where('booking_id',$id)->get();

        $listForNewItems['destinations'] = DestinationActivity::with(['destination' => function($query){
            $query->select('id','name');
        }])->select('id','destination_id','name','price');
        if($channel == 'twt'){
            $orderChannelID = 2;
            $listForNewItems['destinations'] = $listForNewItems['destinations']->where('is_default_twt','1');
        }
        else if($channel == 'jvto'){
            $orderChannelID = 1;
            $listForNewItems['destinations'] = $listForNewItems['destinations']->where('is_default_jvto','1');
        }
        else if($channel == 'klook'){
            $orderChannelID = 3;
            $listForNewItems['destinations'] = $listForNewItems['destinations']->where('is_default_klook','1');
        }
        $listForNewItems['destinations'] = $listForNewItems['destinations']->get()->groupBy(fn($item) => $item->destination->name);
        $listForNewItems['others'] = OthersActivity::get();
        $listForNewItems['cars'] = Car::whereIn('id',[1,2,5,21])->get();
        $listForNewItems['crews'] = CrewRole::where('order_channel_id',$orderChannelID)->get();

        return Inertia::render('Finance/EditExpenseManager', [
            'booking' => $booking,
            'accommodations' => $bookRoom,
            'destinations' => $destinations,
            'resources' => $resources,
            'others' => $others,
            'listForNewItems' => $listForNewItems
        ]);
    }
}
