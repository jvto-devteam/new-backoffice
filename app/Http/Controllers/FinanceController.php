<?php

namespace App\Http\Controllers;

use App\Models\Booking;
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
        $query = Booking::select('id','user_id','total_pax','travel_date_start','grand_total','payment')->with(['user.country','bookingDetail' => function($q){
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
        $summary = [
            'bookings' => $query->count(),
            'grand_total' => $query->sum('grand_total'),
            'paxs' => $query->sum('total_pax'),
            'paid' => $bookings->filter(function($booking) {
                return ($booking->grand_total + $booking->book_add_on_total) - $booking->payment == 0;
            })->count(),
            'dp_paid' => $bookings->filter(function($booking) {
                return $booking->payment > 0 && ($booking->grand_total + $booking->book_add_on_total) - $booking->payment > 0;
            })->count(),
            'unpaid' => $bookings->filter(function($booking) {
                return $booking->payment == 0;
            })->count(),            
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
}
