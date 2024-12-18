<?php

namespace App\Http\Controllers;

use App\Models\CarConfiguration;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    function index(Request $request, $orderCHannel){
        $data['order_channel'] = $orderCHannel;
        $data['title'] = strtoupper($orderCHannel)." Packages";

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
                                $qq->select('id','name','gallery_id')->with('gallery',function($qqq){
                                    $qqq->select('id','image','caption','alt_text');
                                });
                            })->with('secondDestination',function($qq){
                                $qq->select('id','name','gallery_id')->with('gallery',function($qqq){
                                    $qqq->select('id','image','caption','alt_text');
                                });
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
        if($request->from){
            $data['packages'] = $data['packages']->where('start_destination_id',$request->from);
        }
        if($request->end){
            $data['packages'] = $data['packages']->where('end_destination_id',$request->end);
        }
        if($request->json){
            $data['packages'] = $data['packages']->where('id',$request->id)->first();
            $fileName = $data['packages']->name.'.json';
            $jsonContent = json_encode($data['packages'], JSON_PRETTY_PRINT);
        
            return response()->streamDownload(function () use ($jsonContent) {
                echo $jsonContent;
            }, $fileName, [
                'Content-Type' => 'application/json',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            ]);            
            // return response()->json($data['packages']);
        }
        else{
            // $data['packages'] = $data['packages']->get()
            // ->sortBy(fn($package) => $package->duration->day);
            $data['packages'] = $data['packages']->get()
            ->groupBy(function($package) {
                // Format: "City - XD YN Packages"
                return sprintf(
                    "%s - %dD %dN Packages",
                    $package->startDestination->name,
                    $package->duration->day,
                    $package->duration->night
                );
            })
            ->sortBy(function($group, $key) {
                // Split key into parts for sorting
                $parts = explode(' - ', $key);
                $city = $parts[0];
                $duration = (int) filter_var($parts[1], FILTER_SANITIZE_NUMBER_INT);
                
                // City priority (lower number = higher priority)
                $cityPriority = [
                    'Surabaya' => 1,
                    'Bali' => 2,
                    'Yogyakarta' => 3
                ];
                
                // Create sorting value: cityPriority * 100 + duration
                // This ensures city is primary sort key and duration is secondary
                return ($cityPriority[$city] * 100) + $duration;
            });
    
            $data['pax_configuration'] = CarConfiguration::select('id','car_id','pax','price','crew_jvto_role_id','crew_twt_role_id','crew_klook_role_id')
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
                $data['pax_configuration'] = $data['pax_configuration']->where('crew_jvto_role_id','!=',null);
            }
            else{
                $data['pax_configuration'] = $data['pax_configuration']->where('crew_klook_role_id','!=',null);
            }
            $data['pax_configuration'] = $data['pax_configuration']->orderBy('pax','asc')->get();
            // return $data['pax_configuration'];
            return Inertia::render('Packages/Index',['data' => $data]);
        }
    }
}
