<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Booking;
use App\Models\BookingCategory;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    function index(Request $request) {
        $pageInfo = 'Booking Overview';
        $pageTitle = 'Booking Overview';

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
            $data['booking'] = Booking::with(['bookingCategory', 'user.country', 'agent', 'bookingDetail.package.duration', 'bookCar.car.garage', 'guideDriver.person', 'bookingItinerary.bookHotel.hotel', 'bookingItinerary.bookHotel.bookRoom.roomHotel.hotel.area'])->where('travel_date_start', 'like', "$data[year]-$data[month]%");
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
            if ($request->source) {
                if ($request->source == '3') {
                    $data['booking'] = $data['booking']->where('agent_id', '2')->where('booking_category_id',$request->source);
                }
                else{
                    $data['booking'] = $data['booking']->where('agent_id', $request->source);
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
            if ($request->customer_name) {
                $customer_name = $request->customer_name;
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

        return Inertia::render('Schedule/Index',['data' => $data]);
    }
    
    function bookingList(Request $request){
        return Inertia::render('Schedule/BookingList');
    }
    
    function bookingAnalist(Request $request){
        return Inertia::render('Schedule/BookingAnalist');
    }
}
