<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Country;
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
        $perPage = 10;

        $query = Booking::select('id','user_id','total_pax','travel_date_start','media_link','grand_total','payment','special_requirements')->with(['user.country','bookingDetail' => function($q){
            $q->select('id','package_id','booking_id','xss','xxs','xs','s','m','l','xl','xxl','xxxl')->with('package',function($qq){
                $qq->select('id','name','package_code');
            });
        }])->where('status', 'booked')->where('agent_id', 2)->where('travel_date_start','like','%2025%')->orderBy('travel_date_start','asc');
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
    
        // Apply country filter
        if ($country) {
            $query->whereHas('user.country', function($q) use ($country) {
                $q->where('id', $country);
            });
        }        

        $clients = $query->orderBy('id', 'desc')
            ->paginate($perPage)
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
                    'payment_status' => ($client->grand_total+$client->book_add_on_total)-$client->payment == 0 ? 'Paid' : 'Unpaid' ,
                ];
            });
        
        $countries = Country::orderBy('long_name')->get(['id', 'long_name']);
        return Inertia::render('Client/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search', 'start_date', 'end_date', 'country']),
            'countries' => $countries,
        ]);
    }
}
