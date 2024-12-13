<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    function index($orderCHannel){
        $data['packages'] = Package::select('id','name','overview','duration_id','category_id','start_destination_id','end_destination_id','id_url','url')->with([
            'duration' => function($query){
                $query->select('id','name','day','night');
            },
            'category' => function($query){
                $query->select('id','name');
            },
            'itinerary' => function($query){
                $query->select('id','package_id','day','title','activity')->with('itineraryDestination',function($q){
                    $q->select('id','itinerary_id','destination_id','second_destination_id')->with('destination',function($qq){
                        $qq->select('id','name','gallery_id')->with('gallery',function($qqq){
                            $qqq->select('id','image','caption','alt_text');
                        });
                    })->with('secondDestination',function($qq){
                        $qq->select('id','name','gallery_id')->with('gallery',function($qqq){
                            $qqq->select('id','image','caption','alt_text');
                        });
                    });
                });
            },
            'startDestination' => function($query){
                $query->select('id','name');
            },
            'endDestination' => function($query){
                $query->select('id','name');
            },
            'packageBanner' => function($query){
                $query->select('id','package_id','gallery_id')->with('gallery',function($q){
                    $q->select('id','image','caption','alt_text');
                });
            },
            'packageHotel' => function($query){
                $query->select('id','hotel_id','package_id')->with('hotel',function($q){
                    $q->select('id','name','banner');
                })->where('price_plan_id',2)->orderBy('day','asc');
            },
            'packagePrice' => function($query){
                $query->select('id','package_id','price_category_id')->with('priceCategory', function($q){
                    $q->select('id','temp_text','start','end')->orderBy('start','asc');
                })->where('price_plan_id',2);
            }
        ]);
        if($orderCHannel == 'jvto'){
            $data['packages'] = $data['packages']->where('is_publish', '1');
        }
        else{
            $data['packages'] = $data['packages']->where('package_platform', 'klook');
        }
        $data['packages'] = $data['packages']->limit(5)->get()
        ->sortBy(fn($package) => $package->duration->day);
        // return $data['packages'];

        $data['order_channel'] = $orderCHannel;
        $data['title'] = strtoupper($orderCHannel)." Packages";
        return Inertia::render('Packages/Index',['data' => $data]);
    }
}
