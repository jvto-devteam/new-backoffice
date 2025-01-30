<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\BookHotel;
use App\Models\Booking;
use App\Models\BookingCategory;
use App\Models\Destination;
use App\Models\Hotel;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PDF;


class ScheduleController extends Controller
{
    function index(Request $request) {
        $pageInfo = 'Booking Overview';
        $pageTitle = 'Booking Overview';
        $data['filters'] = [
            'search' => $request->search ? $request->search : '',
            'startDate' => $request->startDate ? $request->startDate : date('Y-m-01'),
            'endDate' => $request->endDate ? $request->endDate : date('Y-m-t'),
            'channel' => $request->channel ? $request->channel : '',
            'paymentStatus' => $request->paymentStatus ? $request->paymentStatus : ''
        ];

        $startEnd = explode(" to ", $request->start_end);
        $data['startDate'] = $request->start_end ? $startEnd[0] : date('Y-m-01');
        $data['endDate'] = $request->start_end ? $startEnd[1] : date('Y-m-t', strtotime(date('Y-m-d')));
        $data['month'] = $request->month ? $request->month : date('m');
        $data['year'] = $request->year ? $request->year : date('Y');
        $data['source'] = $request->source ? $request->source : '';

        if ($request->get('month')) {
            $data['startDate'] = date('Y-' . $request->get('month') . '-01');
            $data['endDate'] = date('Y-' . $request->get('month') . '-t');
        }

        $order = $request->order ? $request->order : "travel_date_start-asc";
        $data['order_by'] = explode('-', $order)[0];
        $data['order_type'] = explode('-', $order)[1];
        if ($request->select) {
            $data['selected_field'] = explode(';', $request->select);
            $data['selected_field_string'] = $request->select;
        } else {
            $data['selected_field'] = ['Customer', 'Traveling Date', 'Durations', 'Agent', 'No. of Pax', 'Pickup', 'Drop', 'Vehicle', 'Crew', 'Input Date'];
            $data['selected_field_string'] = implode(';', $data['selected_field']);
        }

        try {
            $data['selectedCategory'] = "";
            if ($request->category) {
                $bookingCategory = BookingCategory::find($request->category);
                $data['selectedCategory'] = $bookingCategory->name;
            }
            $data['bookingCategory'] = BookingCategory::get();
            $data['booking'] = Booking::with(['bookingPayment.paymentMethod','bookingCategory', 'user.country','user.discount', 'agent', 'bookingDetail.package.duration', 'bookCar.car.garage', 'guideDriver.person', 'bookingItinerary.bookHotel.hotel', 'bookingItinerary.bookHotel.bookRoom.roomHotel.hotel.area','bookingItinerary.activityStart.destination'])->where('travel_date_start', 'like', "$data[year]-$data[month]%");;
            if ($request->vendor) {
                $data['agent'] = Agent::find($request->vendor);
                $data['booking'] = $data['booking']->where('agent_id', $request->vendor);
                if ($request->vendor == 2) {
                    if ($request->category) {
                        $data['category'] = BookingCategory::find($request->category);
                        $data['booking'] = $data['booking']->where('booking_category_id', $request->category);
                    } else {
                        $data['booking'] = $data['booking']->where('booking_category_id', '!=', 3);
                    }
                }
            }
            if ($request->channel) {
                if ($request->channel == 'KLOOK') {
                    $data['booking'] = $data['booking']->where('agent_id', '2')->where('booking_category_id',3);
                }
                else if ($request->channel == 'JVTO') {
                    $data['booking'] = $data['booking']->where('agent_id', '2')->where('booking_category_id','!=',3);
                }
                else if ($request->channel == 'TWT') {
                    $data['booking'] = $data['booking']->where('agent_id', '1');
                }
            }
            if ($request->source) {
                if ($request->source == 'KLOOK') {
                    $data['booking'] = $data['booking']->where('agent_id', '2')->where('booking_category_id',3);
                }
                else if ($request->source == 'JVTO') {
                    $data['booking'] = $data['booking']->where('agent_id', '2')->where('booking_category_id','!=',3);
                }
                else if ($request->source == 'TWT') {
                    $data['booking'] = $data['booking']->where('agent_id', '1');
                }
            }
            if($request->package_id){
                $package_id = $request->package_id;
                $data['booking'] = $data['booking']->whereHas('bookingDetail',function($query) use($package_id){
                    $query->where('package_id',$package_id);
                });
            }
            if ($request->booking_id) {
                $booking_id = explode('-', $request->booking_id);
                if (count($booking_id) > 1) {
                    $booking_id = $booking_id[1];
                } else {
                    $booking_id = $request->booking_id;
                }

                $data['booking'] = $data['booking']->where('id', $booking_id);
            }
            if ($request->search) {
                $customer_name = $request->search;
                $data['booking'] = $data['booking']->whereHas('user', function ($query) use ($customer_name) {
                    $query->where('name', "like", "%" . $customer_name . "%");
                });
            }
            if ($request->search) {
                $data['booking'] = $data['booking']->whereHas('user', function ($query) use ($request) {
                    $query->where('name', "like", "%" . $request->search . "%");
                });
            }
            $status = "booked";
            $data['booking_status'] = "CONFIRMED";
            $data['booking_status_color'] = "success";
            if ($request->booking_status) {
                $status = $request->booking_status == 'pending' ? 'pending wise' : $request->booking_status;
                $data['booking'] = $data['booking']->where('status', $status);

                if ($request->booking_status == 'pending') {
                    $data['booking_status'] = strtoupper($request->booking_status);
                    $data['booking_status_color'] = "warning";
                }
            }
            if ($request->get('filter-column')) {
                $filterColumn = $request->get('filter-column');
                $filterId = $request->get('filter-column-item');
                if ($filterColumn == 'Garage') {
                    $data['booking'] = $data['booking']->whereHas('bookCar.car', function ($query) use ($filterId) {
                        $query->where('garage_id', $filterId);
                    });
                } else if ($filterColumn == 'Vehicle') {
                    $data['booking'] = $data['booking']->whereHas('bookCar', function ($query) use ($filterId) {
                        $query->where('car_id', $filterId);
                    });
                } else if ($filterColumn == 'Hotel') {
                    $data['booking'] = $data['booking']->whereHas('bookingItinerary.bookHotel', function ($query) use ($filterId) {
                        $query->where('hotel_id', $filterId);
                    });
                } else if ($filterColumn == 'Crew') {
                    $data['booking'] = $data['booking']->whereHas('guideDriver', function ($query) use ($filterId) {
                        $query->where('guide_id', $filterId);
                    });
                }
            }
            $data['booking'] = $data['booking']->where('status', $status)->orderBy($data['order_by'], $data['order_type'])->get();
            $data['package'] = Package::with('duration')->where('is_publish','1')->get();

        } catch (\Illuminate\Database\QueryException $e) {
            return $e->getMessage();
        }
        // return $data;
        if($request->export){
            return \view('exports.schedule-excel', $data);
        }
        else if($request->pdf){
            // return view('exports.pdf-schedule', $data);
            $pdf = PDF::loadView('exports.pdf-schedule', $data)->setPaper('A4', 'landscape')->setOptions([
                'margin_top' => 5,
                'margin_bottom' => 5,
                'margin_left' => 5,
                'margin_right' => 5,
            ]);
                // Download or display the PDF
            $name = "_".$data['filters']['startDate']."_".$data['filters']['endDate']."_";
            $name .= request()->channel ? request()->channel : 'all';
        
            $name = 'Schedule'.$name.'.pdf';
            return $pdf->download($name);
        }
        else{
            return Inertia::render('Schedule/Index',['data' => $data]);
        }
    }

    function bookingList(Request $request){
        return Inertia::render('Schedule/BookingList');
    }

    function bookingAnalist(Request $request){

        $data['filter'] = [
            'month' => $request->month ? $request->month : date('m'),
            'year' => $request->year ? $request->year : date('Y'),
            'channel' => $request->channel ? $request->channel : 'all',
            'hotel' => $request->hotel ? $request->hotel : '',
            'activity' => $request->activity ? $request->activity : '',
            'activeTab' => $request->activeTab ? $request->activeTab : 'all-reports',
        ];

        $data['destination'] = Destination::whereRaw('id in(1,2,7)')->get(['id','name']);
        $data['hotel'] = Hotel::whereRaw('id in(1,10,11,34)')->get(['id','name']);
        $last_month_year = date('Y-m',strtotime($data['filter']['year']."-".$data['filter']['month']."-01 -1 month"));

        $data['total_booking_current_month'] = Booking::where('travel_date_start', 'like', "%" . $data['filter']['year'] . "-" . $data['filter']['month'] . "%")->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_booking_current_month'] = $data['total_booking_current_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_booking_current_month'] = $data['total_booking_current_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_booking_current_month'] = $data['total_booking_current_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_booking_current_month'] = $data['total_booking_current_month']->count();

        $data['total_booking_last_month'] = Booking::where('travel_date_start', 'like', "%" . $last_month_year . "%")->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_booking_last_month'] = $data['total_booking_last_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_booking_last_month'] = $data['total_booking_last_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_booking_last_month'] = $data['total_booking_last_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_booking_last_month'] = $data['total_booking_last_month']->count();


        if ($data['total_booking_last_month'] > 0) {
            $data['total_booking_percentage_change'] = round(($data['total_booking_current_month'] - $data['total_booking_last_month']) / $data['total_booking_last_month'] * 100);
        } else {
            $data['total_booking_percentage_change'] = 0; // Atau nilai lain sesuai logika bisnis Anda
        }

        if($data['total_booking_percentage_change'] == 0){
            $data['total_booking_percentage_change'] = "";
            $data['total_booking_percentage_change_trend'] = "same";
        }
        else if($data['total_booking_percentage_change'] < 0){
            $data['total_booking_percentage_change'] = $data['total_booking_percentage_change']."%";
            $data['total_booking_percentage_change_trend'] = "down";
        }
        else{
            $data['total_booking_percentage_change'] = "+".$data['total_booking_percentage_change']."%";
            $data['total_booking_percentage_change_trend'] = "up";
        }

        $data['total_invoice_current_month'] = Booking::where('travel_date_start', 'like', "%" . $data['filter']['year'] . "-" . $data['filter']['month'] . "%")
        ->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_invoice_current_month'] = $data['total_invoice_current_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_invoice_current_month'] = $data['total_invoice_current_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_invoice_current_month'] = $data['total_invoice_current_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_invoice_current_month'] = $data['total_invoice_current_month']->sum('grand_total');

        $data['total_expense_current_month'] = Booking::where('travel_date_start', 'like', "%" . $data['filter']['year'] . "-" . $data['filter']['month'] . "%")
        ->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_expense_current_month'] = $data['total_expense_current_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_expense_current_month'] = $data['total_expense_current_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_expense_current_month'] = $data['total_expense_current_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_expense_current_month'] = $data['total_expense_current_month']->sum('expense_internal_total');

        $data['total_invoice_last_month'] = Booking::where('travel_date_start', 'like', "%" . $last_month_year . "%")
        ->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_invoice_last_month'] = $data['total_invoice_last_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_invoice_last_month'] = $data['total_invoice_last_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_invoice_last_month'] = $data['total_invoice_last_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_invoice_last_month'] = $data['total_invoice_last_month']->sum('grand_total');

        $data['total_expense_last_month'] = Booking::where('travel_date_start', 'like', "%" . $last_month_year . "%")
        ->where('status', 'booked');
        if($data['filter']['channel'] != 'all'){
            if($data['filter']['channel'] == 'twt'){
                $data['total_expense_last_month'] = $data['total_expense_last_month']->where('agent_id',1);
            }
            else if($data['filter']['channel'] == 'jvto'){
                $data['total_expense_last_month'] = $data['total_expense_last_month']->where('agent_id',2)->where('booking_category_id','!=',3);
            }
            else{
                $data['total_expense_last_month'] = $data['total_expense_last_month']->where('agent_id',2)->where('booking_category_id',3);
            }
        }
        $data['total_expense_last_month'] = $data['total_expense_last_month']->sum('expense_internal_total');

        $data['total_profit_current_month'] = $data['total_invoice_current_month'] - $data['total_expense_current_month'];

        $data['total_profit_last_month'] = $data['total_invoice_last_month'] - $data['total_expense_last_month'];

        if ($data['total_invoice_last_month'] > 0) {
            $data['total_invoice_percentage_change'] = round(($data['total_invoice_current_month'] - $data['total_invoice_last_month']) / $data['total_invoice_last_month'] * 100);
        } else {
            $data['total_invoice_percentage_change'] = 0; // Atau nilai lain sesuai logika bisnis Anda
        }

        if($data['total_invoice_percentage_change'] == 0){
            $data['total_invoice_percentage_change'] = "";
            $data['total_invoice_percentage_change_trend'] = "same";
        }
        else if($data['total_invoice_percentage_change'] < 0){
            $data['total_invoice_percentage_change'] = $data['total_invoice_percentage_change']."%";
            $data['total_invoice_percentage_change_trend'] = "down";
        }
        else{
            $data['total_invoice_percentage_change'] = "+".$data['total_invoice_percentage_change']."%";
            $data['total_invoice_percentage_change_trend'] = "up";
        }
        $data['total_invoice_current_month'] = "IDR ".number_format($data['total_invoice_current_month'],0,',','.');

        if ($data['total_profit_last_month'] > 0) {
            $data['total_profit_percentage_change'] = round(($data['total_profit_current_month'] - $data['total_profit_last_month']) / $data['total_profit_last_month'] * 100);
        } else {
            $data['total_profit_percentage_change'] = 0; // Atau nilai lain sesuai logika bisnis Anda
        }

        if($data['total_profit_percentage_change'] == 0){
            $data['total_profit_percentage_change'] = "";
            $data['total_profit_percentage_change_trend'] = "same";
        }
        else if($data['total_profit_percentage_change'] < 0){
            $data['total_profit_percentage_change'] = $data['total_profit_percentage_change']."%";
            $data['total_profit_percentage_change_trend'] = "down";
        }
        else{
            $data['total_profit_percentage_change'] = "+".$data['total_profit_percentage_change']."%";
            $data['total_profit_percentage_change_trend'] = "up";
        }
        $data['total_profit_current_month'] = "IDR ".number_format($data['total_profit_current_month'],0,',','.');

        $year = $data['filter']['year'];
        $month = $data['filter']['month'];
        $data['report']['data_hotel'] = [];
        $data['report']['data_hotel']['book_hotel'] = [];
        $data['report']['data_tshirt'] = [];
        $data['report']['data_activity'] = [];

        if($request->activeTab == 'accommodations'){
            $getBookHotel = BookHotel::with([
                'bookRoom.roomHotel',
                'booking.user',
                'bookingItinerary',
            ])
                ->where('hotel_id', $data['filter']['hotel'])
                ->whereHas('booking', function ($query) use ($year, $month) {
                    $query->where('travel_date_start', 'like', "%$year-$month%");
                });
            if($data['filter']['channel'] != 'all'){
                if($data['filter']['channel'] == 'twt'){
                    $getBookHotel->whereHas('booking', function ($query){
                        $query->where('agent_id', 1);
                    });
                }
                else if($data['filter']['channel'] == 'jvto'){
                    $getBookHotel->whereHas('booking', function ($query){
                        $query->where('agent_id', 2)->where('booking_category_id','!=',3);
                    });
                }
                else{
                    $getBookHotel->whereHas('booking', function ($query){
                        $query->where('agent_id', 2)->where('booking_category_id',3);
                    });
                }
            }

            $bookHotel = $getBookHotel->get()->sortBy(function ($item) use ($year, $month) {
                $plusDay = $item->bookingItinerary->day - 1;
                $checkIn = date('Y-m-d', strtotime($item->booking->travel_date_start . " +$plusDay days"));
                return $checkIn;
            });
            $data['report']['data_hotel']['book_hotel'] = $bookHotel;
            $data['report']['data_hotel']['total_booking'] = $bookHotel->count();
            $data['report']['data_hotel']['total_pax'] = $bookHotel->sum('booking.total_pax');
            $data['report']['data_hotel']['total_room'] = $bookHotel->sum('book_room.quantity');
            $data['report']['data_hotel']['total_rate'] = $bookHotel->sum('book_room.room_hotel.rate');
        }

        if ($request->activeTab == 'activities') {
            if ($request->activity == '1') {
                $data['report']['data_activity']['data_bromo'] = $this->getBromoData($year, $month, $data['filter']['channel']);
            }
            elseif ($request->activity == '2') {
                $data['report']['data_activity']['data_ijen'] = $this->getIjenData($year, $month, $data['filter']['channel']);
            } elseif ($request->activity == '7') {
                $data['report']['data_activity']['data_tumpak_sewu'] = $this->getTumpakSewuData($year, $month, $data['filter']['channel']);
            }
        }

        if ($request->activeTab == 't-shirts') {
            $data['report']['data_tshirt'] = $this->getTshirt($year, $month, $data['filter']['channel']);
        }

        // return $data['report']['data_tshirt'];

        return Inertia::render('Schedule/BookingAnalist',['data' => $data, 'total' => 1000]);
    }

    function getTshirt($year, $month, $channel) {

        $get_tshirt = Booking::select([
            'bookings.id',
            'bookings.agent_id',
            'bookings.booking_category_id',
            'users.id as client_id',
            'bookings.travel_date_start',
            'total_pax',
            'users.name AS customer',
            'agents.name as agent_name',
            'booking_details.xss',
            'booking_details.xxs',
            'booking_details.xs',
            'booking_details.s',
            'booking_details.m',
            'booking_details.l',
            'booking_details.xl',
            'booking_details.xxl',
            'booking_details.xxxl'
        ])
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->join('booking_details', 'bookings.id', '=', 'booking_details.booking_id')
            ->join('agents', 'bookings.agent_id', '=', 'agents.id')
            ->whereNotNull('bookings.travel_date_start')
            ->whereMonth('bookings.travel_date_start', $month)
            ->whereYear('bookings.travel_date_start', $year)
            ->where(function ($query) {
                $query->where('booking_details.xss', '>', 0)
                    ->orWhere('booking_details.xxs', '>', 0)
                    ->orWhere('booking_details.xs', '>', 0)
                    ->orWhere('booking_details.s', '>', 0)
                    ->orWhere('booking_details.m', '>', 0)
                    ->orWhere('booking_details.l', '>', 0)
                    ->orWhere('booking_details.xl', '>', 0)
                    ->orWhere('booking_details.xxl', '>', 0)
                    ->orWhere('booking_details.xxxl', '>', 0);
            })
            ->orderBy('bookings.travel_date_start', 'ASC');

        if ($channel != 'all') {
            if ($channel == 'twt') {
                $get_tshirt->where('bookings.agent_id', 1);
            }
            elseif($channel == 'jvto'){
                $get_tshirt->where('bookings.agent_id', 2)->where('bookings.booking_category_id', '!=', 3);
            }
            else{
                $get_tshirt->where('bookings.agent_id', 2)->where('bookings.booking_category_id', 3);
            }
        }

        return $get_tshirt->get();
    }

    function getBromoData($year, $month, $channel) {
        $getBromoData = Booking::select([
            'bookings.id',
            'users.id AS client_id',
            'users.name AS customer',
            'agents.name as agent_name',
            'booking_categories.name as booking_category',
            'at_bromo AS bromo_visit_date',
            'total_pax AS pax',
            'qty_jeep'
        ])
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->join('agents', 'bookings.agent_id', 'agents.id')
            ->leftJoin('booking_categories', 'bookings.booking_category_id', 'booking_categories.id')
            ->whereNotNull('at_bromo')
            ->whereMonth('at_bromo', $month)
            ->whereYear('at_bromo', $year)
            ->orderBy('at_bromo', 'ASC');

        if ($channel != 'all') {
            if ($channel == 'twt') {
                $getBromoData->where('bookings.agent_id', 1);
            } elseif ($channel == 'jvto') {
                $getBromoData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', '!=', 3);
            } else {
                $getBromoData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', 3);
            }
        }

        return $getBromoData->get();
    }

    function getIjenData($year, $month, $channel)
    {
        $getIjenData = Booking::select([
            'bookings.id',
            'users.id as client_id',
            'users.name AS customer',
            'agents.name as agent_name',
            'booking_categories.name as booking_category',
            'at_bondowoso AS ijen_visit_date',
            'total_pax AS pax',
        ])
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->join('agents', 'bookings.agent_id', 'agents.id')
            ->leftJoin('booking_categories', 'bookings.booking_category_id', 'booking_categories.id')
            ->whereNotNull('at_bondowoso')
            ->whereMonth('at_bondowoso', $month)
            ->whereYear('at_bondowoso', $year)
            ->orderBy('at_bondowoso', 'ASC');

        if ($channel != 'all') {
            if ($channel == 'twt') {
                $getIjenData->where('bookings.agent_id', 1);
            } elseif ($channel == 'jvto') {
                $getIjenData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', '!=', 3);
            } else {
                $getIjenData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', 3);
            }
        }

        return $getIjenData->get();
    }

    function getTumpakSewuData($year, $month, $channel)
    {
        $getTumpakSewuData = Booking::select([
            'bookings.id',
            'users.id as client_id',
            'users.name AS customer',
            'agents.name as agent_name',
            'booking_categories.name as booking_category',
            'at_tumpak_sewu AS ijen_visit_date',
            'total_pax AS pax',
        ])
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->join('agents', 'bookings.agent_id', 'agents.id')
            ->leftJoin('booking_categories', 'bookings.booking_category_id', 'booking_categories.id')
            ->whereNotNull('at_tumpak_sewu')
            ->whereMonth('at_tumpak_sewu', $month)
            ->whereYear('at_tumpak_sewu', $year)
            ->orderBy('at_tumpak_sewu', 'ASC');

        if ($channel != 'all') {
            if ($channel == 'twt') {
                $getTumpakSewuData->where('bookings.agent_id', 1);
            } elseif ($channel == 'jvto') {
                $getTumpakSewuData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', '!=', 3);
            } else {
                $getTumpakSewuData->where('bookings.agent_id', 2)->where('bookings.booking_category_id', 3);
            }
        }

        return $getTumpakSewuData->get();
    }
}
