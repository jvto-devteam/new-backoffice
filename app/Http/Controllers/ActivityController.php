<?php

namespace App\Http\Controllers;

use App\Models\DestinationActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityController extends Controller
{
    function index(Request $request) {
        $pageInfo = 'Manage Tour Activities';
        $pageTitle = 'Manage Tour Activities';

        $search = $request->input('search');
        $data['activities'] = [];
        try {
            $getActivities = DestinationActivity::select('destination_activities.id', 'destination_activities.name', 'destination_activities.unit', 'destination_activities.price', 'destinations.name as destination')
                ->join('destinations', 'destinations.id', '=', 'destination_activities.destination_id')
                ->orderBy('id', 'asc');

            if ($search) {
                $getActivities = $getActivities->where('destination_activities.name', 'like', '%' . $search . '%')->orWhere('destination_activities.id', 'like', '%' . $search . '%');
            }
            $data['activities'] = $getActivities->get();
            $data['search'] = $search;

        } catch (\Illuminate\Database\QueryException $e) {
            return $e->getMessage();
        }
        return Inertia::render('Activity/ActivityList',['data' => $data]);
    }

}
