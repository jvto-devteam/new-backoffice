<?php

namespace App\Http\Controllers;

use App\Models\OthersActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MiscellaneousController extends Controller
{
    function index(Request $request) {
        $pageInfo = 'Manage Tour Miscellaneous';
        $pageTitle = 'Manage Tour Miscellaneous';

        $search = $request->input('search');
        $data['miscellaneous'] = [];
        try {
            $getMiscellaneous = OthersActivity::select('id', 'name','other_activity_code', 'price')
                ->where('other_activity_code', '!=', '')
                ->orderBy('other_activity_code', 'ASC');

            if ($search) {
                $getMiscellaneous = $getMiscellaneous->where('name', 'like', '%' . $search . '%')->orWhere('other_activity_code', 'like', '%' . $search . '%');
            }

            $data['miscellaneous'] = $getMiscellaneous->get();
            $data['search'] = $search;

        } catch (\Illuminate\Database\QueryException $e) {
            return $e->getMessage();
        }
//        return $data;
        return Inertia::render('Miscellaneous/MiscellaneousList',['data' => $data]);
    }

}
