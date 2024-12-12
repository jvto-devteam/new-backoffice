<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\Destination;
use App\Models\OthersActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    function expensePackage(){
        return Inertia::render('Expense/ExpensePackage');
    }

    function expenseItem(){
        $data['destination'] = Destination::select('id','code','name')
        ->whereIn('id',[2,1,7,4])
        ->with([
            'hotels' => function($query){
                $query->select('id','destination_id','name');
            },
            'hotels.roomHotel' => function($query){
                $query->select('id','hotel_id','room_name','rate');
            },
            'activity' => function($query){
                $query->select('id','destination_id','name','unit','price');
            },

        ])->orderBy('code','asc')->get();
        $data['vehicle'] = Car::whereIn('id',[1,2,5])->get(['id','name','price']);
        $data['others_activity'] = OthersActivity::get(['id','name','unit','price']);
        // return $data;
        return Inertia::render('Expense/ExpenseItem',['data' => $data]);
    }
}
