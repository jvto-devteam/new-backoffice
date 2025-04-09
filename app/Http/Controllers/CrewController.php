<?php

namespace App\Http\Controllers;

use App\Models\GuideDriver;
use Illuminate\Http\Request;

class CrewController extends Controller
{
    function index(Request $request){
        $crew = GuideDriver::select('id','name','tags','new_role as role')->where(function ($query) {
            $query->whereNull('garage_id')
                  ->orWhere('id', 9);
        })
        ->orderBy('name', 'asc')
        ->get();
    
        return $crew;
    }
}
