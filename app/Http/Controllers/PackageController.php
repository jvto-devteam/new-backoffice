<?php

namespace App\Http\Controllers;

use App\Models\CarConfiguration;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class PackageController extends Controller
{
    function index(Request $request, $orderChannel){
        $data['order_channel'] = $orderChannel;
        $data['title'] = strtoupper($orderChannel)." Packages";

        $data['packages'] = Package::select('id','name','overview','duration_id','category_id','start_destination_id','end_destination_id','id_url','url')->with([
            'duration' => function($query){
                $query->select('id','name','day','night');
            },
            'category' => function($query){
                $query->select('id','name');
            },
            'itinerary' => function($query) use($orderChannel){
                $query->select('id','package_id','day','title','activity')->with(
                    [
                        'itineraryDestination' => function($q) use($orderChannel){
                            $q->select('id','itinerary_id','destination_id','second_destination_id')->with('destination',function($qq) use($orderChannel){
                                $qq->select('id','name','gallery_id','activity_id')->with(['gallery' => function($qqq){
                                    $qqq->select('id','image','caption','alt_text');
                                },'activityDestination' => function($qqq){
                                    $qqq->select('id','name');
                                },'activity' => function($qqq) use($orderChannel){
                                    $qqq->select('id','destination_id','name','unit','formula','price');
                                    if($orderChannel == 'jvto'){
                                        $qqq->where('is_default_jvto','1');
                                    }
                                    else if($orderChannel == 'klook'){
                                        $qqq->where('is_default_klook','1');
                                    }
                                    else if($orderChannel == 'twt'){
                                        $qqq->where('is_default_twt','1');
                                    }
                                }]);
                            })->with('secondDestination',function($qq) use($orderChannel){
                                $qq->select('id','name','gallery_id','activity_id')->with(['gallery' => function($qqq) use($orderChannel){
                                    $qqq->select('id','image','caption','alt_text');
                                },'activityDestination' => function($qqq){
                                    $qqq->select('id','name');
                                },'activity' => function($qqq) use($orderChannel){
                                    $qqq->select('id','destination_id','name','unit','formula','price');
                                    if($orderChannel == 'jvto'){
                                        $qqq->where('is_default_jvto','1');
                                    }
                                    else if($orderChannel == 'klook'){
                                        $qqq->where('is_default_klook','1');
                                    }
                                    else if($orderChannel == 'twt'){
                                        $qqq->where('is_default_twt','1');
                                    }
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
                    $q->select('id','name','banner','address','url','map_url','lunch_rate','dinner_rate')->with('roomHotelConfiguration',function($qq){
                        $qq->select('id','hotel_id','room_id','pax','qty')->with('room',function($qqq){
                            $qqq->select('id','room_name','rate');
                        });
                    });
                })->where('price_plan_id',2)->orderBy('day','asc');
            },
            'packagePrice' => function($query){
                $query->select('id','package_id','price_category_id','price','price_before_disc')->with('priceCategory', function($q){
                    $q->select('id','temp_text','start','end')->orderBy('start','asc');
                })->where('price_plan_id',2);
            }
        ]);
        if($orderChannel == 'jvto'){
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

//            $data['packages'] = $data['packages']->where('id',$request->id)->first();
            $packageId = $request->id;
            $apiUrl = "https://javavolcano-touroperator.com/public/api/backoffice/packages/$packageId";

            // Fetch data from API
            $response = Http::get($apiUrl);
            $packageData = $response->json();

            // Create filename and remove ':' characters
            $fileName = str_replace(':', '', $packageData['package']['name']) . '.json';

            // Convert to pretty-printed JSON
            $jsonContent = json_encode($packageData, JSON_PRETTY_PRINT);

            return response()->streamDownload(function () use ($jsonContent) {
                echo $jsonContent;
            }, $fileName, [
                'Content-Type' => 'application/json',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            ]);
            // return response()->json($data['packages']);
        }
        if($request->pdf){
            return Inertia::render('Packages/PackageFlipbook');
        }
        else{
            // $data['packages'] = $data['packages']->get()
            // ->sortBy(fn($package) => $package->duration->day);
            $data['packages'] = $data['packages']->get()
            ->groupBy(function($package) {
                return sprintf(
                    "%s - %dD %dN Packages",
                    $package->startDestination->name,
                    $package->duration->day,
                    $package->duration->night
                );
            })
            ->map(function($group) {
                // Add package code to each package in group
                $counter = 1;
                return $group->map(function($package) use (&$counter) {
                    // Create destination prefix
                    $prefixMap = [
                        'Surabaya' => 'SUB',
                        'Bali' => 'BALI',
                        'Yogyakarta' => 'YOGYA'
                    ];
                    $prefix = $prefixMap[$package->startDestination->name];

                    // Create package code
                    $package->package_code = sprintf(
                        "%s-%dD%dN-%03d",
                        $prefix,
                        $package->duration->day,
                        $package->duration->night,
                        $counter++
                    );

                    return $package;
                });
            })
            ->sortBy(function($group, $key) {
                $parts = explode(' - ', $key);
                $city = $parts[0];
                $duration = (int) filter_var($parts[1], FILTER_SANITIZE_NUMBER_INT);

                $cityPriority = [
                    'Surabaya' => 1,
                    'Bali' => 2,
                    'Yogyakarta' => 3
                ];

                return ($cityPriority[$city] * 100) + $duration;
            });
            // return $data['packages'];

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
            if($orderChannel == 'jvto'){
                $data['pax_configuration'] = $data['pax_configuration']->where('crew_jvto_role_id','!=',null);
            }
            else{
                $data['pax_configuration'] = $data['pax_configuration']->where('crew_klook_role_id','!=',null);
            }
            $data['pax_configuration'] = $data['pax_configuration']->orderBy('pax','asc')->get();
            $data['order_channel'] = $orderChannel;
            // return $data['pax_configuration'];
            return Inertia::render('Packages/Index',['data' => $data]);
        }
    }

    function packageDetail()
    {
        return Inertia::render('Packages/TourLandingPage');
    }
}
