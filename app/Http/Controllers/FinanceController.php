<?php

namespace App\Http\Controllers;

use App\Models\BookCarActivity;
use App\Models\BookCrewActivity;
use App\Models\BookDestinationActivity;
use App\Models\BookGuideDriver;
use App\Models\BookHotel;
use App\Models\BookHotelMeal;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\BookOthersActivity;
use App\Models\BookRoomHotel;
use App\Models\Car;
use App\Models\CarConfiguration;
use App\Models\CrewRole;
use App\Models\DestinationActivity;
use App\Models\Itinerary;
use App\Models\OthersActivity;
use App\Models\Package;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PDF;
use Illuminate\Support\Str;


class FinanceController extends Controller
{
    function invoice(Request $request){
        $search = $request->input('search');
        $startDate = $request->get('start_date') ? $request->get('start_date') : date('Y-m-01');
        $endDate = $request->get('end_date') ? $request->get('end_date') : date('Y-m-t');
        $package = $request->input('package');
        $channel = $request->input('channel');
        $perPage = 3;
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
                    'package_code' => $booking->bookingDetail[0]->package->package_code ?? "-",
                    'package' => $booking->bookingDetail[0]->package->name ?? 'CUSTOM PACKAGE',
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
        $query = Booking::select('id','user_id','total_pax','travel_date_start','grand_total','payment','expense_internal_total','total_expense_paid','total_expense_balance','total_expense_debt','booking_category_id','agent_id','package_duration')->with(['user.country','bookingDetail' => function($q){
            $q->select('id','package_id','booking_id')->with('package',function($qq){
                $qq->select('id','name','package_code');
            });
        }])->where('status', 'booked')->where('travel_date_start','like','%2025%')->orderBy('travel_date_start','asc');
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
            if($channel == 'twt'){
                $query->where('agent_id',1);
            }
            else if($channel == 'klook'){
                $query->where('agent_id',2)->where('booking_category_id',3);
            }
            else{
                $query->where('agent_id',2)->where('booking_category_id','!=',3);
            }
        }

        $bookings = $query->get();
        // Total Booking, Total Expense, Total Paid, Total Unpaid 
        $summary = [
            'bookings' => $query->count(),
            'total_expense' => $query->sum('expense_internal_total'),
            'paid' => $query->sum('total_expense_paid'),
            'unpaid' => $query->sum('total_expense_balance'),            
            'debt' => $query->sum('total_expense_debt'),            
        ];
       
        $booking = $query->paginate($perPage)
            ->through(function($booking) {
                $night = $booking->package_duration-1;
                return [
                    'id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'name' => $booking->user->name,
                    'channel' => $booking->agent_id == 1 ? 'TWT' : ($booking->booking_category_id != 3 ? 'JVTO' : 'KLOOK'),
                    'package_code' => $booking->bookingDetail[0]->package_id ? $booking->bookingDetail[0]->package->package_code : '-',
                    'package' => $booking->bookingDetail[0]->package_id ? $booking->bookingDetail[0]->package->name : $booking->package_duration." Days ".$night." Nights" ,
                    'numb_of_pax' => $booking->total_pax ?? 0,
                    'trip_date' => $booking->travel_date_start ?? '-',
                    'total_per_pax' => $booking->grand_total/$booking->total_pax,
                    'total' => $booking->grand_total,
                    'expense' => $booking->expense_internal_total,
                    'expense_paid' => $booking->total_expense_paid,
                    'expense_balance' => $booking->total_expense_balance,
                    'expense_debt' => $booking->total_expense_debt,
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
        $booking = Booking::select('id','user_id','total_pax','travel_date_start','grand_total','agent_id','booking_category_id','booking_date','package_duration','invoice_code_origin')->with(['user' => function($query){
            $query->select('id','name');
        },'bookingDetail' => function($query){
            $query->select('id','package_id','booking_id')->with(['package' => function($q){
                $q->select('id','name','duration_id')->with('duration');
            }]);
        }])->where('id',$id)->first();
        $pax = $booking->total_pax;
        $day = $booking->bookingDetail[0]->package ? $booking->bookingDetail[0]->package->duration->day : $booking->package_duration;

        $totalAccommodations = 0;
        $totalDestinations = 0;
        $totalOthers = 0;
        $totalResources = 0;

        $bookRoom = BookHotel::select('id','booking_id','hotel_id','b','l','d','is_paid','is_debt')->with(['hotel' => function($query){
            $query->select('id','name','lunch_rate','dinner_rate');
        },'bookRoom' => function($query){
            $query->select('id','book_hotel_id','room_hotel_id','quantity','subtotal')->with(['roomHotel' => function($q){
                $q->select('id','room_name','rate');
            }]);
        },'bookHotelMeal'])->where('booking_id',$id)
        ->get()
        ->map(function($booking) use($pax,&$totalAccommodations) {
            if($booking->l == '1'){
                $cekBookHotelMeals = BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','lunch')->first();
                $lunchTotal = $cekBookHotelMeals && $cekBookHotelMeals->subtotal ? $cekBookHotelMeals->subtotal : 0;;
                if(!$cekBookHotelMeals){
                    $lunch = new BookHotelMeal;
                    $lunch->book_hotel_id = $booking->id;
                    $lunch->booking_id = $booking->booking_id;
                    $lunch->hotel_id = $booking->hotel_id;
                    $lunch->meals = 'lunch';
                    $lunch->qty = $pax;
                    $lunch->price = $booking->hotel->lunch_rate;
                    $lunch->subtotal = $pax*$booking->hotel->lunch_rate;
                    $lunch->save();
                    $lunchTotal = $lunch->subtotal;
                }
                $totalAccommodations += $lunchTotal;
            }
            else{
                BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','lunch')->delete();
            }
            if($booking->d == '1'){
                $cekBookHotelMeals = BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','dinner')->first();
                $dinnerTotal = $cekBookHotelMeals && $cekBookHotelMeals->subtotal ? $cekBookHotelMeals->subtotal : 0;;
                
                if(!$cekBookHotelMeals){
                    $dinner = new BookHotelMeal;
                    $dinner->book_hotel_id = $booking->id;
                    $dinner->booking_id = $booking->booking_id;
                    $dinner->hotel_id = $booking->hotel_id;
                    $dinner->meals = 'dinner';
                    $dinner->qty = $pax;
                    $dinner->price = $booking->hotel->dinner_rate;
                    $dinner->subtotal = $pax*$booking->hotel->dinner_rate;
                    $dinner->save();

                    $dinnerTotal = $dinner->subtotal;
                }
                $totalAccommodations += $dinnerTotal;

            }
            else{
                BookHotelMeal::where('book_hotel_id',$booking->id)->where('meals','dinner')->delete();
            }

            if($booking->is_paid == '0' && (!$booking->is_debt || $booking->is_debt == '0')){
                $booking->is_paid = '1';
                $booking->save();
            }

            $booking->bookRoom->map(function($room) use(&$totalAccommodations) {
                if ($room->subtotal === null) {
                    $room->subtotal = $room->roomHotel->rate * $room->quantity;
                    $room->save();
                }
                $totalAccommodations += $room->subtotal;
                return $room;
            });
            return $booking;
        });

        if($booking->agent_id == 1){
            $channel = 'twt';
            $booking->reference = $booking->invoice_code_origin;
        }
        else if($booking->agent_id == 2){
            if($booking->booking_category_id == 3){
                $channel = 'klook';
                $booking->reference = $booking->invoice_code_origin;
            }
            else{
                $booking->reference = "JVTO-".$booking->id;
                $channel = 'jvto';
            }
        }
        $booking->channel = strtoupper($channel);

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
        }])->where('booking_id',$id)->get()
        
        ->map(function($activity) use (&$totalDestinations) { // Gunakan reference
            $totalDestinations += $activity->subtotal;
            return $activity;
        })
        ->groupBy(fn($item) => $item->destination->name);

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

        $others = BookOthersActivity::with('othersActivity')
        ->where('booking_id', $id)
        ->get()
        ->map(function($other) use (&$totalOthers) { // Gunakan reference
            $totalOthers += $other->subtotal;
            return $other;
        });

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
            if($cekCarActivities == 0 && $cekCar){
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
            if($cekCrewActivities == 0 && $cekCar){
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
        
        $resources['cars'] = BookCarActivity::with(['car' => function($query) {
            $query->select('id', 'name');
        }])
        ->where('booking_id', $id)
        ->get()
        ->map(function($car) use (&$totalResources) { // Gunakan reference
            $totalResources += $car->subtotal;
            return $car;
        });
    
        $resources['crews'] = BookCrewActivity::with(['crewRole' => function($query) {
            $query->select('id', 'role');
        }])
        ->where('booking_id', $id)
        ->get()
        ->map(function($crew) use (&$totalResources) { // Gunakan reference
            $totalResources += $crew->subtotal;
            return $crew;
        });
        
        $listForNewItems['destinations'] = DestinationActivity::with(['destination' => function($query){
            $query->select('id','name');
        }])->select('id','destination_id','name','price');
        if($channel == 'twt'){
            $orderChannelID = 2;
        }
        else if($channel == 'jvto'){
            $orderChannelID = 1;
        }
        else if($channel == 'klook'){
            $orderChannelID = 3;
        }
        $listForNewItems['destinations'] = $listForNewItems['destinations']->get()->groupBy(fn($item) => $item->destination->name);
        $listForNewItems['others'] = OthersActivity::get();
        // return $listForNewItems['others'];
        $listForNewItems['cars'] = Car::whereIn('id',[1,2,5,21])->get();
        $listForNewItems['crews'] = CrewRole::where('order_channel_id',$orderChannelID)->get();
        // return $listForNewItems;
        return Inertia::render('Finance/EditExpenseManager', [
            'booking' => $booking,
            'accommodations' => $bookRoom,
            'destinations' => $destinations,
            'resources' => $resources,
            'others' => $others,
            'listForNewItems' => $listForNewItems
        ]);
    }
    function updateExpense(Request $request){
        $booking = Booking::where('id',$request->booking_id)->first();
        if($request->accommodations){
            foreach ($request->accommodations as $key => $value) {
                $bookHotel = BookHotel::find($value['hotel_id']);
                $bookHotel->is_paid = $value['is_debt'] == '0' ? '1' : '0';
                $bookHotel->is_debt = $value['is_debt'];
                if($bookHotel->is_paid == '1'){
                    $bookHotel->paid_at = date('Y-m-d H:i:s');
                }
                else{
                    $bookHotel->paid_at = null;
                }
                $bookHotel->save();
                if(count($request->accommodations[$key]['rooms']) != 0){
                    foreach ($request->accommodations[$key]['rooms'] as $index => $val) {
                        $bookRoom = BookRoomHotel::find($val['id']);
                        $bookRoom->quantity = $val['quantity'];
                        $bookRoom->subtotal = $val['quantity']*$val['rate'];
                        $bookRoom->save();
                    }
                }     

                if(count($request->accommodations[$key]['meals']) != 0){
                    foreach ($request->accommodations[$key]['meals'] as $index => $val) {
                        $bookHotelMeals = BookHotelMeal::find($val['id']);
                        $bookHotelMeals->qty = $val['qty'];
                        $bookHotelMeals->price = $val['price'];
                        $bookHotelMeals->subtotal = $val['qty']*$val['price'];
                        $bookHotelMeals->save();
                    }
                }                

            }
        }

        if($request->destinations){
            BookDestinationActivity::where('booking_id',$request->booking_id)->delete();
            foreach ($request->destinations as $key => $value) {
                foreach ($value['activities'] as $index => $val) {
                    // Verificar si necesitamos crear una nueva actividad de destino
                    $destinationActivityId = $val['destination_activity_id'] ?? null;
                    
                    if(empty($destinationActivityId)){
                        // Crear nueva actividad de destino
                        $destinationActivity = new DestinationActivity;
                        $destinationActivity->destination_id = $val['destination_id'];
                        $destinationActivity->name = $val['name'];
                        $destinationActivity->destination_activity_code = '';
                        $destinationActivity->unit = 'no';
                        $destinationActivity->formula = '1';
                        $destinationActivity->price = $val['price'];
                        $destinationActivity->is_default_jvto = '0';
                        $destinationActivity->is_default_klook = '0';
                        $destinationActivity->is_default_twt = '0';
                        $destinationActivity->save();
        
                        // Asignar el ID a una variable local
                        $destinationActivityId = $destinationActivity->id;
                    }
        
                    // Crear la asociación con la reserva
                    $bookDestinationActivity = new BookDestinationActivity;
                    $bookDestinationActivity->booking_id = $request->booking_id;
                    $bookDestinationActivity->destination_id = $val['destination_id'];
                    $bookDestinationActivity->destination_activity_id = $destinationActivityId;
                    $bookDestinationActivity->qty = $val['quantity'];
                    $bookDestinationActivity->price = $val['price'];
                    $bookDestinationActivity->subtotal = $val['quantity']*$val['price'];
                    $bookDestinationActivity->status_paid = $val['is_debt'] == '0' ? 'paid' : 'unpaid';
                    if($bookDestinationActivity->status_paid == 'paid'){
                        $bookDestinationActivity->paid_date = date('Y-m-d');
                    }
                    $bookDestinationActivity->is_debt = $val['is_debt'];
                    $bookDestinationActivity->save();
                }
            }
        }
        
        if($request->others){
            BookOthersActivity::where('booking_id',$request->booking_id)->delete();
            foreach ($request->others as $key => $value) {
                // Primero, asegúrate de tener un others_activity_id válido
                $othersActivityId = $value['others_activity_id'] ?? null;
                
                // Si no hay ID o el item es nuevo, crea una nueva actividad
                if(empty($othersActivityId) || empty($value['id'])){
                    $othersActivity = new OthersActivity;
                    $othersActivity->name = $value['name'] ?? 'Unnamed Activity';
                    $othersActivity->other_activity_code = '';
                    $othersActivity->unit = 'no';
                    $othersActivity->formula = '1';
                    $othersActivity->price = $value['price'];
                    $othersActivity->is_default = '0';
                    $othersActivity->save();
        
                    // Usa directamente el ID recién creado
                    $othersActivityId = $othersActivity->id;
                }
        
                $bookOthersActivity = new BookOthersActivity;
                $bookOthersActivity->booking_id = $request->booking_id;
                $bookOthersActivity->others_activity_id = $othersActivityId; // Usa la variable local
                $bookOthersActivity->qty = $value['quantity'];
                $bookOthersActivity->price = $value['price'];
                $bookOthersActivity->subtotal = $value['quantity']*$value['price'];
                $bookOthersActivity->status_paid = $value['is_debt'] == '0' ? 'paid' : 'unpaid';
                if($bookOthersActivity->status_paid == 'paid'){
                    $bookOthersActivity->paid_date = date('Y-m-d');
                }
                $bookOthersActivity->is_debt = $value['is_debt'];
                $bookOthersActivity->save();
            }
        }
        if($request->resources['cars']){
            BookCarActivity::where('booking_id',$request->booking_id)->delete();
            foreach ($request->resources['cars'] as $key => $value) {
                $bookCarActivity = new BookCarActivity;
                $bookCarActivity->booking_id = $request->booking_id;
                $bookCarActivity->car_id = $value['car_id'];
                $bookCarActivity->qty = $value['quantity'];
                $bookCarActivity->price = $value['price'];
                $bookCarActivity->subtotal = $value['quantity']*$value['price'];
                $bookCarActivity->status_paid = $value['is_debt'] == '0' ? 'paid' : 'unpaid';
                if($bookCarActivity->status_paid == 'paid'){
                    $bookCarActivity->paid_date = date('Y-m-d');
                }
                $bookCarActivity->is_debt = $value['is_debt'];
                $bookCarActivity->save();
            }
        }

        if($request->resources['crews']){
            BookCrewActivity::where('booking_id',$request->booking_id)->delete();
            foreach ($request->resources['crews'] as $key => $value) {
                $bookCrewActivity = new BookCrewActivity;
                $bookCrewActivity->booking_id = $request->booking_id;
                $bookCrewActivity->crew_role_id = $value['crew_role_id'];
                $bookCrewActivity->qty = $value['quantity'];
                $bookCrewActivity->price = $value['price'];
                $bookCrewActivity->subtotal = $value['quantity']*$value['price'];
                $bookCrewActivity->status_paid = $value['is_debt'] == '0' ? 'paid' : 'unpaid';
                if($bookCrewActivity->status_paid == 'paid'){
                    $bookCrewActivity->paid_date = date('Y-m-d');
                }
                $bookCrewActivity->is_debt = $value['is_debt'];
                $bookCrewActivity->save();
            }
        }

        if(!$booking->expense_file_internal){
            $booking->expense_internal_total = $request->summary['totalAmount'];
            $booking->total_expense_paid = $request->summary['paidAmount'];
            $booking->total_expense_balance = 0;
            $booking->total_expense_debt = $request->summary['debtAmount'];
            $booking->save();
        }
        return back()->with('message', 'Expense saved successfully');
    }
    function downloadExpense($id){
        $booking = Booking::select('id','user_id','total_pax','travel_date_start','grand_total','agent_id','booking_category_id','booking_date','package_duration')->with(['user' => function($query){
            $query->select('id','name');
        }])->where('id',$id)->first();
        $booking = [
            'customer_name' => $booking->user->name,
            'travel_date_start' => date('d F Y', strtotime($booking->travel_date_start)),
            'total_pax' => $booking->total_pax,
            'duration' => $booking->package_duration." Days ".($booking->package_duration == 1 ? 1 : $booking->package_duration-1)." Nights",
            'total_invoice' => $booking->grand_total + $booking->book_add_on_total
        ];

        $option = request()->segment(4);
        
        $bookRoom = BookHotel::select('id','booking_id','hotel_id','b','l','d','is_paid','is_debt')->with(['hotel' => function($query){
            $query->select('id','name','lunch_rate','dinner_rate');
        },'bookRoom' => function($query){
            $query->select('id','book_hotel_id','room_hotel_id','quantity','subtotal')->with(['roomHotel' => function($q){
                $q->select('id','room_name','rate');
            }]);
        },'bookHotelMeal']);
        if($option == 'pay-later'){
            $bookRoom = $bookRoom->where('is_debt','1');
        }
        $bookRoom = $bookRoom->where('booking_id',$id)
        ->get()->map(function($query){
            return [
                'hotel' => $query->hotel->name,
                'is_debt' => $query->is_debt,
                'rooms' => $query->bookRoom->map(function($room){
                    return [
                        'room' => $room->roomHotel->room_name,
                        'quantity' => $room->quantity,
                        'price' => $room->subtotal/$room->quantity,
                        'subtotal' => $room->subtotal,
                    ];
                }),
                'meals' => $query->bookHotelMeal->map(function($meals){
                    return [
                        'meals' => $meals->meals,
                        'quantity' => $meals->qty,
                        'price' => $meals->price,
                        'subtotal' => $meals->subtotal,
                    ];
                })
            ];
        });
        
        $destinations = BookDestinationActivity::select('id','destination_id','destination_activity_id','qty','price','subtotal','status_paid','is_debt')->with(['destination' => function($query){
            $query->select('id','name');
        },'destinationActivity' => function($query){
            $query->select('id','name','unit');
        }]);

        if($option == 'pay-later'){
            $destinations = $destinations->where('is_debt','1');
        }

        $destinations = $destinations->where('booking_id',$id)->get()
        ->groupBy(fn($item) => $item->destination->name) // Grouping sebelum mapping
        ->map(function ($items) {
            return $items->map(function ($query) {
                return [
                    'item' => $query->destinationActivity->name,
                    'quantity' => $query->qty,
                    'price' => $query->price,
                    'subtotal' => $query->subtotal,
                    'is_debt' => $query->is_debt,
                ];
            });
        });        
        $resources['cars'] = BookCarActivity::with(['car' => function($query) {
            $query->select('id', 'name');
        }]);
        if($option == 'pay-later'){
            $resources['cars'] = $resources['cars']->where('is_debt','1');
        }

        $resources['cars'] = $resources['cars']->where('booking_id', $id)
        ->get()->map(function($query){
            return [
                'item' => $query->car->name,
                'quantity' => $query->qty,
                'price' => $query->price,
                'subtotal' => $query->subtotal,
                'is_debt' => $query->is_debt,
            ];
        });

        $resources['crews'] = BookCrewActivity::with(['crewRole' => function($query) {
            $query->select('id', 'role');
        }]);
        if($option == 'pay-later'){
            $resources['crews'] = $resources['crews']->where('is_debt','1');
        }

        $resources['crews'] = $resources['crews']->where('booking_id', $id)
        ->get()->map(function($query){
            return [
                'item' => $query->crewRole->role,
                'quantity' => $query->qty,
                'price' => $query->price,
                'subtotal' => $query->subtotal,
                'is_debt' => $query->is_debt,
            ];
        });

        $others = BookOthersActivity::with('othersActivity')
        ->where('booking_id', $id);
        if($option == 'pay-later'){
            $others = $others->where('is_debt','1');
        }
        
        $others = $others->get()->map(function($query){
            return [
                'item' => $query->othersActivity->name,
                'quantity' => $query->qty,
                'price' => $query->price,
                'subtotal' => $query->subtotal,
                'is_debt' => $query->is_debt,
            ];
        });
        $drivers = [];
        $escorts = [];
        $ijens = [];
        $data = [
            'title' => ucwords(str_replace('-',' ',$option))." Expense", 
            'option' => $option,
            'booking' => $booking,
            'accommodations' => $bookRoom,
            'destinations' => $destinations,
            'resources' => $resources,
            'others' => $others,
            'plotting' => [
                'drivers' => BookGuideDriver::select('id', 'guide_id')->with(['person' => function ($query) {
                    $query->select('id', 'name');
                }])->where('booking_id', $id)->where('type', 'driver')->get()->each(function ($query) use (&$drivers) {
                    $drivers[] = $query->person->name;
                }) ? implode(', ', $drivers) : '',
        
                'escorts' => BookGuideDriver::select('id', 'guide_id')->with(['person' => function ($query) {
                    $query->select('id', 'name');
                }])->where('booking_id', $id)->where('type', 'guide')->where('guide_ijen', '0')->get()->each(function ($query) use (&$escorts) {
                    $escorts[] = $query->person->name;
                }) ? implode(', ', $escorts) : '',
        
                'ijens' => BookGuideDriver::select('id', 'guide_id')->with(['person' => function ($query) {
                    $query->select('id', 'name');
                }])->where('booking_id', $id)->where('type', 'guide')->where('guide_ijen', '1')->get()->each(function ($query) use (&$ijens) {
                    $ijens[] = $query->person->name;
                }) ? implode(', ', $ijens) : '',        
            ]
        ];
        // return view('exports/expense',$data);
        $pdf = PDF::loadView('exports/expense', $data);
        $name = Str::slug($booking['customer_name']);
        // Opsional: Set paper size dan orientation
        $pdf->setPaper('A4', 'portrait');
        return $pdf->download($option.'-expense-'.$name.'.pdf');                
    }
    function settlement(){
        $booking = Booking::where('status','')->get();
    }
    function receivableIncome(Request $request){
        $startDate = $request->start_date ? $request->start_date : date('Y-m-01');
        $endDate = $request->end_date ? $request->end_date : date('Y-m-t');
        $jvto = BookingPayment::with(['paymentMethod','booking.user'])->whereBetween('created_at',[$startDate,$endDate])->orderBy('created_at','asc')->get()->map(function($query){
            return [
                'id' => $query->id,
                'source' => 'JVTO',
                'booking_code' => $query->booking->booking_code,
                'date' => date('d F Y', strtotime($query->created_at)),                
                'customer' => $query->booking->user->name,
                'booking_id' => $query->booking_id,
                'payment_method_id' => $query->payment_method_id,
                'payment_method' => $query->paymentMethod->name,
                'reference' => $query->reference,
                'description' => $query->is_add_on == '1' ? $query->description." (Add On)" : $query->description,
                'nominal' => $query->nominal,
                'status' => 'PAID',
            ];
        });
        $others = Booking::where('status', 'booked')
        ->whereBetween('travel_date_start',[$startDate,$endDate])
        ->where(function($query) {
            $query->where('agent_id', 2)
                  ->where('booking_category_id', 3)
                  ->orWhere('agent_id', 1);
        })
        ->get()
        ->map(function($query) {
            // Determine the source based on agent_id
            $source = $query->agent_id == 2 ? 'KLOOK' : 'TWT';
    
            return [
                'id' => $query->id,
                'source' => $source,
                'booking_code' => $query->invoice_code_origin,
                'date' => date('d F Y',strtotime($query->travel_date_start)),
                'customer' => $query->user->name,
                'booking_id' => $query->id,
                'payment_method_id' => $query->payment_method_vendor_id,
                'payment_method' => $query->is_vendor_paid == '1' ? $query->paymentMethodVendor->name : '-',
                'reference' => $query->is_vendor_paid == '1' ? $query->is_vendor_paid_reference : '-',
                'description' => $source,
                'nominal' => $query->grand_total,
                'status' => $query->is_vendor_paid == '1' ? 'PAID' : 'UNPAID',
            ];
        });
        $paymentMethod = PaymentMethod::get();
        $filters = $request->only(['search','source','status','payment_method']);
        $filters['start_date'] = $startDate;
        $filters['end_date'] = $endDate;
        $payment = $others->merge($jvto)->sortBy('date')->values();
        if (!empty($filters)) {
            $payment = $payment->filter(function($item) use ($filters) {
                $keep = true;
                
                // Filter by search term (case-insensitive search in customer name and booking code)
                if (!empty($filters['search'])) {
                    $searchTerm = strtolower($filters['search']);
                    $customerName = strtolower($item['customer']);
                    $bookingCode = strtolower($item['booking_code']);
                    
                    if (strpos($customerName, $searchTerm) === false && strpos($bookingCode, $searchTerm) === false) {
                        $keep = false;
                    }
                }
                
                // Filter by source (KLOOK, TWT, JVTO)
                if (!empty($filters['source']) && $item['source'] !== $filters['source']) {
                    $keep = false;
                }
                
                // Filter by status (PAID, UNPAID)
                if (!empty($filters['status']) && $item['status'] !== $filters['status']) {
                    $keep = false;
                }
                
                // Filter by payment method
                if (!empty($filters['payment_method']) && $item['payment_method_id'] != $filters['payment_method']) {
                    $keep = false;
                }
                
                // Date filtering is already handled in the initial database queries
                
                return $keep;
            })->values(); // Reset array keys after filtering
        }        

        return Inertia::render('Finance/ReceivableIncome', ['payments' => $payment,'filters' => $filters,'paymentMethod' => $paymentMethod]);

    }
    function profitabilityReport(Request $request){
        $monthParam = $request->month ? $request->month : date('m');  
        $month = $request->month ? date('Y-'.$request->month) : date('Y-m');
        $getJvto = Booking::where('status', 'booked')
        ->where('agent_id', 2)
        ->where('booking_category_id', '!=', 3)
        ->where('travel_date_start','like',$month.'%')
        ->get();

        $jvto['totalRevenue'] = $getJvto->sum(function($booking) {
            return $booking->grand_total + $booking->book_add_on_total;
        });
        $jvto['totalOperational'] = $getJvto->sum('expense_internal_total');
        $jvto['totalProfit'] = $jvto['totalRevenue']-$jvto['totalOperational'];
        $jvto['profitPercentage'] = $jvto['totalRevenue'] > 0 
        ? round(($jvto['totalProfit'] / $jvto['totalRevenue']) * 100, 2) 
        : 0;        
        $jvto['color'] = "#0EA5E9";
        $jvto['bgColor'] = "#F0F9FF";
        $jvto['icon'] = "https://javavolcano-touroperator.com/assets/img/download.png";
        $jvto['description'] = "Japan Volcano Tour Operator";
        $jvto['name'] = "JVTO";

        $getKlook = Booking::where('status', 'booked')
        ->where('agent_id', 2)
        ->where('booking_category_id', 3)
        ->where('travel_date_start','like',$month.'%')
        ->get();

        $klook['totalRevenue'] = $getKlook->sum(function($booking) {
            return $booking->grand_total + $booking->book_add_on_total;
        });
        $klook['totalOperational'] = $getKlook->sum('expense_internal_total');
        $klook['totalProfit'] = $klook['totalRevenue']-$klook['totalOperational'];
        $klook['profitPercentage'] = $klook['totalRevenue'] > 0 
        ? round(($klook['totalProfit'] / $klook['totalRevenue']) * 100, 2) 
        : 0;        
        $klook['color'] = "#10B981";
        $klook['bgColor'] = "#ECFDF5";
        $klook['icon'] = "https://img.involve.asia/ia_background/803_ULo2708G.png";
        $klook['description'] = "Online Travel Booking Platform";
        $klook['name'] = "Klook";


        $getTwt = Booking::where('status', 'booked')
        ->where('agent_id', 1)
        ->where('travel_date_start','like',$month.'%')
        ->get();

        $twt['totalRevenue'] = $getTwt->sum(function($booking) {
            return $booking->grand_total + $booking->book_add_on_total;
        });
        $twt['totalOperational'] = $getTwt->sum('expense_internal_total');
        $twt['totalProfit'] = $twt['totalRevenue']-$twt['totalOperational'];
        $twt['profitPercentage'] = $twt['totalRevenue'] > 0 
        ? round(($twt['totalProfit'] / $twt['totalRevenue']) * 100, 2) 
        : 0;    
        $twt['color'] = "#F59E0B";
        $twt['bgColor'] = "#FFFBEB";
        $twt['icon'] = "https://static.wixstatic.com/media/096aa7_9a15b0951a7441caa3d8323cc6b8da8b~mv2.png/v1/fit/w_2500,h_1330,al_c/096aa7_9a15b0951a7441caa3d8323cc6b8da8b~mv2.png";
        $twt['description'] = "The Window Travel";
        $twt['name'] = "TWT";


        $data = [$jvto,$klook,$twt];

        return Inertia::render('Finance/ProfitabilityReport', ['data' => $data, 'month' => $monthParam]);
    }
}
