<?php

namespace App\Http\Controllers;

use App\Models\BookGuideDriver;
use App\Models\GuideDriver;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CrewController extends Controller
{
    function index(Request $request){
        $crew = GuideDriver::select('id','name','photo','tags','new_role as role')->where(function ($query) {
            $query->whereNull('garage_id')
                  ->orWhere('id', 9);
        })
        ->orderBy('name', 'asc')
        ->get();
    
        return $crew;
    }
    function details(Request $request, $id){
        $year = $request->year ?? date('Y');
        $month = $request->month ?? date('m');
        $crew = GuideDriver::select('id','name','photo','is_driver','tags', 'new_role as role')->with(['bookGuideDriver' => function($query) use($year,$month,$id){
            $query->select('id','guide_id','booking_id','start_date','end_date','guide_ijen')
            ->with(['booking' => function($q) use($id){
                $q->select('id','user_id','agent_id','booking_category_id')->with(['user' => function($qq){
                    $qq->select('id','name');
                },'crewReview' => function($qq) use($id){
                    $qq->select('id','booking_id','crew_id','rate','note')->where('crew_id',$id)->first();
                }]);
            }])
            ->whereLike('start_date','%'.$year.'-'.$month.'%')
            ->orderBy('start_date','asc');
        },'crewReview' => function($query){
            $query->select('id','booking_id','crew_id','rate','note','created_at')
            ->with(['booking' => function($q){
                $q->select('id','user_id','agent_id','booking_category_id')->with(['user' => function($qq){
                    $qq->select('id','name');
                }]);
            }])
            ->orderBy('created_at','asc');
        }])->where('id',$id)->firstOrFail();
        $crew->bookGuideDriver->transform(function ($item) {
            $agentId = $item->booking->agent_id ?? null;
            $categoryId = $item->booking->booking_category_id ?? null;
        
            if ($agentId == 1) {
                $item->booking->channel = 'TWT';
            } elseif ($categoryId == 3) {
                $item->booking->channel = 'KLOOK';
            } else {
                $item->booking->channel = 'JVTO';
            }

            unset($item->booking->agent_id);
            unset($item->booking->booking_category_id);

            return $item;
        });        
        $crew->crewReview->transform(function ($item) {
            $agentId = $item->booking->agent_id ?? null;
            $categoryId = $item->booking->booking_category_id ?? null;
        
            if ($agentId == 1) {
                $item->booking->channel = 'TWT';
            } elseif ($categoryId == 3) {
                $item->booking->channel = 'KLOOK';
            } else {
                $item->booking->channel = 'JVTO';
            }

            unset($item->booking->agent_id);
            unset($item->booking->booking_category_id);
        
            return $item;
        });        
        $crew->photo = $crew->photo ? 'https://javavolcano-touroperator.com/assets/img/guide/'.$crew->photo : 'https://javavolcano-touroperator.com/assets/img/guide/default.jpg';
        $crew->escort_trips = $crew->bookGuideDriver->filter(function($item){
            return $item->guide_ijen == '0';
        })->count();
        $crew->ijen_trips = $crew->bookGuideDriver->filter(function($item){
            return $item->guide_ijen == '1';
        })->count();

        $data = [
            'year' => $year,
            'month' => $month,
            'crew' => $crew,
        ];

        return Inertia::render('Crew/Details',['res' => $data]);
    }
}
