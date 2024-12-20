<?php

namespace App\Http\Controllers;

use App\Models\CarConfiguration;
use App\Models\Country;
use App\Models\OthersActivity;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    function create($orderCHannel){
        $data['packages'] = Package::select('id','name','overview','duration_id','category_id','start_destination_id','end_destination_id','id_url','url')->with([
            'duration' => function($query){
                $query->select('id','name','day','night');
            },
            'category' => function($query){
                $query->select('id','name');
            },
            'itinerary' => function($query){
                $query->select('id','package_id','day','title','activity')->with(
                    [
                        'itineraryDestination' => function($q){
                            $q->select('id','itinerary_id','destination_id','second_destination_id')->with('destination',function($qq){
                                $qq->select('id','name','gallery_id','activity_id')->with(['gallery' => function($qqq){
                                    $qqq->select('id','image','caption','alt_text');
                                },'activityDestination' => function($qqq){
                                    $qqq->select('id','name');
                                },'activity' => function($qqq){
                                    $qqq->select('id','destination_id','name','unit','price');
                                }]);
                            })->with('secondDestination',function($qq){
                                $qq->select('id','name','gallery_id','activity_id')->with(['gallery' => function($qqq){
                                    $qqq->select('id','image','caption','alt_text');
                                },'activityDestination' => function($qqq){
                                    $qqq->select('id','name');
                                },'activity' => function($qqq){
                                    $qqq->select('id','destination_id','name','unit','price');
                                }]);
                            });
                        },
                        'itineraryMeals' => function($q){
                            $q->select('id','itinerary_id','breakfast','lunch','dinner')->where('price_plan_id',2);
                        }
                    ]
                );
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
                $query->select('id','hotel_id','package_id','day')->with('hotel',function($q){
                    $q->select('id','name','banner','address','url','map_url');
                })->where('price_plan_id',2)->orderBy('day','asc');
            },
            'packagePrice' => function($query){
                $query->select('id','package_id','price_category_id','price','price_before_disc')->with('priceCategory', function($q){
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

        $data['packages'] = $data['packages']->get()
        ->sortBy(fn($package) => $package->duration->day);

        $data['car_configuration'] = CarConfiguration::select('id','car_id','pax','price','crew_jvto_role_id','crew_twt_role_id','crew_klook_role_id')
        ->with(['car' => function($query){
            $query->select('id','name');
        },'crewJvtoRole' => function($query){
            $query->select('id','order_channel_id','role');
        },'crewTwtRole' => function($query){
            $query->select('id','order_channel_id','role');
        },'crewKlookRole' => function($query){
            $query->select('id','order_channel_id','role');
        }]);
        if($orderCHannel == 'jvto'){
            $data['car_configuration'] = $data['car_configuration']->where('crew_jvto_role_id','!=',null);
        }
        else{
            $data['car_configuration'] = $data['car_configuration']->where('crew_klook_role_id','!=',null);
        }
        $data['car_configuration'] = $data['car_configuration']->orderBy('pax','asc')->get();
        $data['others_activities'] = OthersActivity::select('name','unit','price')->get();

        // return $data['others_activities'];

        $data['nationality'] = Country::get();
        
        return Inertia::render('Bookings/Create',['data' => $data]);
    }
}
