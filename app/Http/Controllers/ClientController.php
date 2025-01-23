<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Country;
use App\Models\Package;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $country = $request->input('country');
        $package = $request->input('package');
        $channel = $request->input('channel');
        $export = $request->input('export');
        $perPage = 10;

        $query = Booking::select('id','booking_category_id','user_id','total_pax','travel_date_start','media_link','grand_total','payment','special_requirements')->with(['user.country','bookingDetail' => function($q){
            $q->select('id','package_id','booking_id','xss','xxs','xs','s','m','l','xl','xxl','xxxl')->with('package',function($qq){
                $qq->select('id','name','package_code');
            });
        },'bookAddOn.addOn'])->where('status', 'booked')->where('agent_id', 2)->where('travel_date_start','like','%2025%')->orderBy('travel_date_start','asc');
        // Apply search
        if ($search) {
            $query->whereHas('user',function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
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
        // Apply country filter
        if ($country) {
            $query->whereHas('user.country', function($q) use ($country) {
                $q->where('id', $country);
            });
        }        

        if ($export) {
            $clients = $query->get()->map(function($client) {
                return [
                    'Boooking ID' => $client->id,
                    'Name' => $client->user->name,
                    'Country' => $client->user->country?->long_name ?? '-',
                    'Email' => $client->user->email,
                    'Phone' => $client->user->phone,
                    'Order Channel' => $client->booking_category_id == 3 ? 'KLOOK' : 'JVTO',
                    'Package' => $client->bookingDetail[0]->package->name ?? '-',
                    'Package Code' => $client->bookingDetail[0]->package->package_code,
                    'Number of Pax' => $client->total_pax ?? 0,
                    'Trip Date' => $client->travel_date_start ?? '-',
                    'Grand Total' => $client->grand_total + $client->book_add_on_total,
                    'Payment' => $client->payment,
                    'Balance' => ($client->grand_total + $client->book_add_on_total) - $client->payment,
                    'Payment Status' => ($client->grand_total + $client->book_add_on_total) - $client->payment == 0 ? 'Paid' : 'Unpaid',
                ];
            });
    
            $filename = 'client_data_' . date('Y-m-d_His') . '.xls';
            
            header("Content-type: application/vnd-ms-excel");
            header("Content-Disposition: attachment; filename=$filename");
            
            return view('exports.clients', compact('clients'));
        }        

        $clients = $query->paginate($perPage)
            ->through(function($client) {
                return [
                    'id' => $client->id,
                    'user_id' => $client->user_id,
                    'name' => $client->user->name,
                    'country' => $client->user->country?->long_name ?? '-',
                    'email' => $client->user->email,
                    'phone' => $client->user->phone,
                    'package' => $client->bookingDetail[0]->package->name ?? '-',
                    'numb_of_pax' => $client->total_pax ?? 0,
                    'trip_media' => $client->media_link ?? '-',
                    'trip_date' => $client->travel_date_start ?? '-',
                    'special_requirements' => $client->special_requirements ?? '-',
                    'grand_total' => $client->grand_total+$client->book_add_on_total,
                    'channel' => $client->booking_category_id == 3 ? 'KLOOK' : 'JVTO',
                    'payment' => $client->payment,
                    'xss' => $client->bookingDetail[0]->xss,
                    'xss' => $client->bookingDetail[0]->xss,
                    'xs' => $client->bookingDetail[0]->xs,
                    's' => $client->bookingDetail[0]->s,
                    'm' => $client->bookingDetail[0]->m,
                    'l' => $client->bookingDetail[0]->l,
                    'xl' => $client->bookingDetail[0]->xl,
                    'xxl' => $client->bookingDetail[0]->xxl,
                    'xxxl' => $client->bookingDetail[0]->xxxl,
                    'package_code' => $client->bookingDetail[0]->package->package_code,
                    'balance' => ($client->grand_total+$client->book_add_on_total)-$client->payment,
                    'payment_status' => ($client->grand_total+$client->book_add_on_total)-$client->payment == 0 ? 'Paid' : 'Unpaid',
                    'add_on' => $client->bookAddOn,
                ];
            });
        
        $countries = Country::orderBy('long_name')->get(['id', 'long_name']);
        $packages = Package::where('is_publish','1')->orWhere('package_platform','klook')->orderBy('package_code')->get(['id','package_code','name']);
        return Inertia::render('Client/Index', [
            'clients' => $clients,
            'packages' => $packages,
            'filters' => $request->only(['search', 'start_date', 'end_date', 'country', 'package','channel']),
            'countries' => $countries,
        ]);
    }
}
