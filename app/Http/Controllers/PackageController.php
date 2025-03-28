<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\CarConfiguration;
use App\Models\Destination;
use App\Models\Duration;
use App\Models\Gallery;
use App\Models\Hotel;
use App\Models\Itinerary;
use App\Models\ItineraryDestination;
use App\Models\ItineraryDetail;
use App\Models\ItineraryMeal;
use App\Models\Location;
use App\Models\OthersActivity;
use App\Models\Package;
use App\Models\PackageBanner;
use App\Models\PackageDestination;
use App\Models\PackageHotel;
use App\Models\PackageMeal;
use App\Models\PackagePrice;
use App\Models\PriceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PackageController extends Controller
{
    function index(Request $request, $orderChannel)
    {
        $data['order_channel'] = $orderChannel;
        $data['title'] = strtoupper($orderChannel) . " Packages";

        $data['packages'] = Package::select('id', 'name', 'overview', 'duration_id', 'category_id', 'start_destination_id', 'end_destination_id', 'id_url', 'url','package_code')->with([
            'duration' => function ($query) {
                $query->select('id', 'name', 'day', 'night');
            },
            'category' => function ($query) {
                $query->select('id', 'name');
            },
            'itinerary' => function ($query) use ($orderChannel) {
                $query->select('id', 'package_id', 'day', 'title', 'activity')->with(
                    [
                        'itineraryDestination' => function ($q) use ($orderChannel) {
                            $q->select('id', 'itinerary_id', 'destination_id', 'second_destination_id')->with('destination', function ($qq) use ($orderChannel) {
                                $qq->select('id', 'name', 'gallery_id', 'activity_id')->with(['gallery' => function ($qqq) {
                                    $qqq->select('id', 'image', 'caption', 'alt_text');
                                }, 'activityDestination' => function ($qqq) {
                                    $qqq->select('id', 'name');
                                }, 'activity' => function ($qqq) use ($orderChannel) {
                                    $qqq->select('id', 'destination_id', 'name', 'unit', 'formula', 'price');
                                    if ($orderChannel == 'jvto') {
                                        $qqq->where('is_default_jvto', '1');
                                    } else if ($orderChannel == 'klook') {
                                        $qqq->where('is_default_klook', '1');
                                    } else if ($orderChannel == 'twt') {
                                        $qqq->where('is_default_twt', '1');
                                    }
                                }]);
                            })->with('secondDestination', function ($qq) use ($orderChannel) {
                                $qq->select('id', 'name', 'gallery_id', 'activity_id')->with(['gallery' => function ($qqq) use ($orderChannel) {
                                    $qqq->select('id', 'image', 'caption', 'alt_text');
                                }, 'activityDestination' => function ($qqq) {
                                    $qqq->select('id', 'name');
                                }, 'activity' => function ($qqq) use ($orderChannel) {
                                    $qqq->select('id', 'destination_id', 'name', 'unit', 'formula', 'price');
                                    if ($orderChannel == 'jvto') {
                                        $qqq->where('is_default_jvto', '1');
                                    } else if ($orderChannel == 'klook') {
                                        $qqq->where('is_default_klook', '1');
                                    } else if ($orderChannel == 'twt') {
                                        $qqq->where('is_default_twt', '1');
                                    }
                                }]);
                            });
                        },
                        'itineraryMeals' => function ($q) {
                            $q->select('id', 'itinerary_id', 'breakfast', 'lunch', 'dinner')->where('price_plan_id', 2);
                        }
                    ]
                );
            },
            'startDestination' => function ($query) {
                $query->select('id', 'name');
            },
            'endDestination' => function ($query) {
                $query->select('id', 'name');
            },
            'packageBanner' => function ($query) {
                $query->select('id', 'package_id', 'gallery_id')->with('gallery', function ($q) {
                    $q->select('id', 'image', 'caption', 'alt_text');
                });
            },
            'packageHotel' => function ($query) {
                $query->select('id', 'hotel_id', 'package_id', 'day')->with('hotel', function ($q) {
                    $q->select('id', 'name', 'banner', 'address', 'url', 'map_url', 'lunch_rate', 'dinner_rate')->with('roomHotelConfiguration', function ($qq) {
                        $qq->select('id', 'hotel_id', 'room_id', 'pax', 'qty')->with('room', function ($qqq) {
                            $qqq->select('id', 'room_name', 'rate');
                        });
                    });
                })->where('price_plan_id', 2)->orderBy('day', 'asc');
            },
            'packagePrice' => function ($query) {
                $query->select('id', 'package_id', 'price_category_id', 'price', 'price_before_disc')->with('priceCategory', function ($q) {
                    $q->select('id', 'temp_text', 'start', 'end')->orderBy('start', 'asc');
                })->where('price_plan_id', 2);
            }
        ]);
        if ($orderChannel == 'jvto') {
            $data['packages'] = $data['packages']->where('is_publish', '1')->where('category_id', 1);
        } else {
            $data['packages'] = $data['packages']->where('package_platform', 'klook');
        }
        if ($request->from) {
            $data['packages'] = $data['packages']->where('start_destination_id', $request->from);
        }
        if ($request->end) {
            $data['packages'] = $data['packages']->where('end_destination_id', $request->end);
        }
        if ($request->json) {

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
        if ($request->pdf) {
            return Inertia::render('Packages/PackageFlipbook');
        } else {
            // $data['packages'] = $data['packages']->get()
            // ->sortBy(fn($package) => $package->duration->day);
            $data['packages'] = $data['packages']->get()
                ->groupBy(function ($package) {
                    return sprintf(
                        "%dD %dN - %s Packages",
                        $package->duration->day,
                        $package->duration->night,
                        $package->startDestination->name
                    );
                })
                ->map(function ($group) {
                    // Add package code to each package in group
                    $counter = 1;
                    return $group->map(function ($package) use (&$counter) {
                        // Create destination prefix
                        $prefixMap = [
                            'Surabaya' => 'SUB',
                            'Bali' => 'BALI',
                            'Yogyakarta' => 'YOGYA'
                        ];
                        $prefix = $prefixMap[$package->startDestination->name];

                        // Create package code
                        $package->package_code_custom = sprintf(
                            "%s-%dD%dN-%03d",
                            $prefix,
                            $package->duration->day,
                            $package->duration->night,
                            $counter++
                        );

                        return $package;
                    });
                })
                ->sortBy(function ($group, $key) {
                    $parts = explode(' - ', $key);
                    $duration = (int)filter_var($parts[0], FILTER_SANITIZE_NUMBER_INT);
                    $city = trim(explode('Packages', $parts[1])[0]);

                    $cityPriority = [
                        'Surabaya' => 1,
                        'Bali' => 2,
                        'Yogyakarta' => 3
                    ];

                    // Primary sort by duration, secondary sort by city priority
                    return ($duration * 100) + $cityPriority[$city];
                });
            // return $data['packages'];

            $data['pax_configuration'] = CarConfiguration::select('id', 'car_id', 'pax', 'price', 'crew_jvto_role_id', 'crew_twt_role_id', 'crew_klook_role_id')
                ->with(['car' => function ($query) {
                    $query->select('id', 'name');
                }, 'crewJvtoRole' => function ($query) {
                    $query->select('id', 'order_channel_id', 'role');
                }, 'crewTwtRole' => function ($query) {
                    $query->select('id', 'order_channel_id', 'role');
                }, 'crewKlookRole' => function ($query) {
                    $query->select('id', 'order_channel_id', 'role');
                }]);
            if ($orderChannel == 'jvto') {
                $data['pax_configuration'] = $data['pax_configuration']->where('crew_jvto_role_id', '!=', null);
            } else {
                $data['pax_configuration'] = $data['pax_configuration']->where('crew_klook_role_id', '!=', null);
            }
            $data['pax_configuration'] = $data['pax_configuration']->orderBy('pax', 'asc')->get();
            $data['order_channel'] = $orderChannel;
            // return $data['pax_configuration'];
            return Inertia::render('Packages/Index', ['data' => $data]);
        }
    }

    function details($code){
        $package = Package::with(['packagePrice' => function($query){
            $query->select('package_prices.id','package_id','price_categories.temp_text as pax','price')->join('price_categories','package_prices.price_category_id','price_categories.id')->where('price_plan_id',2);
        },'startDestination','endDestination','duration' => function($duration){
            $duration->select('id','name','day');
        },'itinerary' => function($query){
            $query->select('id','package_id','day')->with(['itineraryDestination' => function($itiDest){
                $itiDest->select('id','itinerary_id','destination_id','second_destination_id')->with(['destination' => function($destination){
                    $destination->select('id','name')->with(['activity' => function($activity){
                        $activity->select('id','destination_id','name as item','formula','price')->where('is_default_jvto','1');
                    }]);
                },'secondDestination' => function($destination){
                    $destination->select('id','name');
                }]);
            }]);
        },'packageHotel' => function($packageHotel){
            $packageHotel->select('id','package_id','day','hotel_id')->with(['hotel' => function($hotel){
                $hotel->select('id','name','lunch_rate','dinner_rate')->with(['roomHotelConfiguration' => function($roomHotelConfiguration){
                    $roomHotelConfiguration->select('id','room_id','hotel_id','pax','qty')->with(['room' => function($room){
                        $room->select('id','room_name','rate');
                    }]);
                }]);
            }])->where('price_plan_id',2);
        }])->where('package_code',$code)->first();

        $data['package'] = [
            'id' => $package->id,
            'duration_day' => $package->duration->day,
        ];
        $activities = [];
        foreach ($package->itinerary as $key => $value) {
            if($value->itineraryDestination->destination && count($value->itineraryDestination->destination->activity) != 0){
                $activities[$value->itineraryDestination->destination->name] = [];
                foreach ($value->itineraryDestination->destination->activity as $index => $val) {
                    $activities[$value->itineraryDestination->destination->name][] = [
                        'id' => $val->id,
                        'item' => $val->item,
                        'formula' => $val->formula,
                        'price' => $val->price,
                    ];
                }
            }
        }
        foreach ($package->itinerary as $key => $value) {
            if($value->itineraryDestination->secondDestination && count($value->itineraryDestination->secondDestination->activity) != 0){
                $activities[$value->itineraryDestination->secondDestination->name] = [];
                foreach ($value->itineraryDestination->secondDestination->activity as $index => $val) {
                    $activities[$value->itineraryDestination->secondDestination->name][] = [
                        'id' => $val->id,
                        'item' => $val->name,
                        'formula' => $val->formula,
                        'price' => $val->price,
                    ];
                }
            }
        }

        $othersActivities = OthersActivity::select('id','name','formula','price')->where('is_default','1')->get();
        $resources = CarConfiguration::with(['car','crewJvtoRole'])->whereNotNull('crew_jvto_role_id')->get()->map(function($query){
            return [
                'id' => $query->id,
                'pax' => $query->pax,
                'cars' => [
                    'car_id' => $query->car_id,
                    'car_name' => $query->car->name,
                    'price' => $query->price,
                ],
                'crews' => [
                    'crew_role_id' => $query->crewJvtoRole->id,
                    'crew_name' => $query->crewJvtoRole->role,
                    'price' => $query->crewJvtoRole->rate,
                ],
            ];
        });

        $data['expense'] = [
            'package' => [
                'id' => $package->id,
                'code' => $package->package_code,
                'name' => $package->name,
                'start' => $package->startDestination->name,
                'end' => $package->endDestination->name,
                'duration_day' => $package->duration->day,
                'duration_name' => $package->duration->name,
                'prices' => $package->packagePrice
            ],
            'accommodation' => $package->packageHotel,
            'activities' => $activities,
            'others' => $othersActivities,
            'resources' => $resources,
        ];
        return $data['expense'];
        $fileName = "Master Expense Package ".$package->name . '.json';

        // Convert to pretty-printed JSON
        $jsonContent = json_encode($data['expense'], JSON_PRETTY_PRINT);

        return response()->streamDownload(function () use ($jsonContent) {
            echo $jsonContent;
        }, $fileName, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);

    }

    function create()
    {
        $data['locations'] = Location::orderBy('name','asc')->get();
        $data['hotels'] = Hotel::select('id','name')->orderBy('name','asc')->get();
        $data['activities'] = Activity::select('id','activity_category_id','name')->where('id','!=',1)->orderBy('name','asc')->get();
        $data['startEnd']  = Destination::select('id','name')->whereIn('id',[3,4,17])->orderBy('name','asc')->get();
        $data['destinations'] = Destination::with(['galleries'])->select('id','name')->where('is_publish','1')->orderBy('name','asc')->get()->map(function($query){
            return [
                'id' => $query->id,
                'name' => $query->name,
                'galleries' => $query->galleries->map(function($q) {
                    return [
                        'id' => $q->id,
                        'url' => "https://javavolcano-touroperator.com/assets/img/destinations/".$q->image,
                        'caption' => $q->caption,
                        'alt_text' => $q->alt_text,
                    ];
                }),
            ];
        });
        $data['page'] = 'create';
        $data['packages'] = [
            'package_info' => [
                'id' => '',
                'title' => '',
                'category' => 1,
                'duration' => 1,
                'departure_id' => '',
                'return_id' => '',
                'cover_photo' => null,
                'other_photos' => [],
                'selling_points' => '',
            ],
            'itinerary' => [],
            'prices' => [],
        ];
        return Inertia::render('Packages/Form', $data);
    }

    function edit($id)
    {
        $package = Package::with(['duration','packageBanner.gallery','packagePrice.priceCategory','packageHotel','itinerary.itineraryDetail.activity'])->where('id',$id)->firstOrFail();
        $data['locations'] = Location::orderBy('name','asc')->get();
        $data['hotels'] = Hotel::select('id','name')->orderBy('name','asc')->get();
        $data['activities'] = Activity::select('id','activity_category_id','name')->where('id','!=',1)->orderBy('name','asc')->get();
        $data['startEnd']  = Destination::select('id','name')->whereIn('id',[3,4,17])->orderBy('name','asc')->get();
        $data['destinations'] = Destination::with(['galleries'])->select('id','name')->where('is_publish','1')->orderBy('name','asc')->get()->map(function($query){
            return [
                'id' => $query->id,
                'name' => $query->name,
                'galleries' => $query->galleries->map(function($q) {
                    return [
                        'id' => $q->id,
                        'url' => "https://javavolcano-touroperator.com/assets/img/destinations/".$q->image,
                        'caption' => $q->caption,
                        'alt_text' => $q->alt_text,
                    ];
                }),
            ];
        });
        $data['page'] = 'edit';
        $data['packages'] = [
            'package_info' => [
                'id' => $package->id,
                'title' => $package->name,
                'category' => $package->category_id,
                'duration' => $package->duration->day,
                'departure_id' => $package->start_destination_id,
                'return_id' => $package->end_destination_id,
                'cover_photo' => [
                    'preview' => "https://javavolcano-touroperator.com/assets/img/destinations/".$package->packageBanner[0]->gallery->image,
                    'id' => $package->packageBanner[0]->gallery->id,
                    'alt_text' => $package->packageBanner[0]->gallery->alt_text,
                    'caption' => $package->packageBanner[0]->gallery->caption,
                    'destinationId' => $package->packageBanner[0]->gallery->destination_id,
                    'isFromLibrary' => true
                ],
                'other_photos' => $package->packageBanner->skip(1)->map(function($q) {
                    return [
                        'preview' => "https://javavolcano-touroperator.com/assets/img/destinations/".$q->gallery->image,
                        'id' => $q->gallery->id,
                        'alt_text' => $q->gallery->alt_text,
                        'caption' => $q->gallery->caption,
                        'destinationId' => $q->gallery->destination_id,
                        'isFromLibrary' => true
                    ];
                })->values(),
                'selling_points' => $package->short_description ? $package->short_description : $package->overview,
            ],
            'itinerary' =>
            $package->itinerary->map(function($q) use($package){
                $packageHotel = $package->packageHotel->where('price_plan_id',2)->where('day',$q->day)->first();
                $hotel_id = $packageHotel ? $packageHotel->hotel_id : '';
                return [
                    'day' => $q->day,
                    'title' => $q->title,
                    'description' => $q->activity,
                    'activities' => $q->itineraryDetail->map(function($qq) use($hotel_id){
                        $itineraryMeals = false;
                        if($qq->activity->activity_category_id == 4){
                            if($qq->activity_id == 9){ 
                                $meals = "breakfast";
                            }
                            else if($qq->activity_id == 2){
                                $meals = "lunch";
                            }
                            else if($qq->activity_id == 4){
                                $meals = "dinner";
                            }
                            $itineraryMeals = ItineraryMeal::where('itinerary_id',$qq->itinerary_id)->where('price_plan_id',2)->where($meals,'1')->first();
                        }
                        return [
                            'type' => $qq->activity->activity_category_id,
                            'time' => $qq->time,
                            'activity' => $qq->activity_id == 3 ? $hotel_id : $qq->activity_id,
                            'notes' => $qq->notes,
                            'include' => $itineraryMeals ? true : false,
                        ];
                    })->values(),
                ];
            })->values(),
            'prices' => $package->packagePrice->sortBy('priceCategory.start')->map(function($q){
                return [
                    'startPax' => $q->priceCategory->start,
                    'endPax' => $q->priceCategory->end,
                    'price' =>  number_format($q->price,0,',','.'),
                    'isUnlimitedMax' => $q->priceCategory->end == 0 ? true : false,
                ];
            })->values(),
        ];
        return Inertia::render('Packages/Form', $data);
    }

    function store(Request $request){
        try {
            DB::beginTransaction();
            // return $request->all();
            $getDuration = Duration::where('day',$request->duration)->first();
            if(!$getDuration){
                $night = $request->duration - 1;
                $getDuration = new Duration();
                $getDuration->name = $request->duration." Days ".$night." Nights";
                $getDuration->day = $request->duration;
                $getDuration->night = $night;
                $getDuration->save();
            }
            if ($request->category == 2) {
                $prefix = "STD";
            } else {
                // Prefix based on start destination
                if ($request->departure_id == 4) {
                    $prefix = "SUB";
                } elseif ($request->departure_id == 3) {
                    $prefix = "BALI";
                } else {
                    // Default prefix for other destinations (can be customized as needed)
                    $prefix = "TOUR";
                }
            }
            
            // Format the duration part
            $durationFormat = $request->duration . "D" . ($request->duration - 1) . "N";
            
            // Find the last package with the same prefix and duration format to determine the sequence number
            $lastPackage = Package::where('package_code', 'LIKE', $prefix . '-' . $durationFormat . '-%')
                                ->orderBy('package_code', 'desc')
                                ->first();
            
            // Determine the next sequence number
            if ($lastPackage) {
                // Extract the sequence number from the last package code
                $parts = explode('-', $lastPackage->package_code);
                $lastSequence = intval(end($parts));
                $nextSequence = $lastSequence + 1;
            } else {
                // If no previous package exists with this format, start with 1
                $nextSequence = 1;
            }
            
            // Format the package code with 3-digit padding for the sequence number
            $package_code = $prefix . '-' . $durationFormat . '-' . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);        
            $highestIdUrl = Package::where('start_destination_id', $request->departure_id)
            ->where('duration_id', $getDuration->id)
            ->max('id_url');

            // Increment by 1 or start with 1 if this is the first
            $nextIdUrl = $highestIdUrl ? $highestIdUrl + 1 : 1;        

            $package = new Package();
            $package->package_code = $package_code;
            $package->name = $request->title;
            $package->category_id = $request->category;
            $package->duration_id = $getDuration->id;
            $package->start_destination_id = $request->departure_id;
            $package->end_destination_id = $request->return_id;
            $package->overview = $request->selling_points;
            $package->short_description = $request->selling_points;
            $package->other_information = '-';
            $package->review_rating = 5;
            $package->review_total = 50;
            $package->id_url = $nextIdUrl;
            $package->b = 0;
            $package->l = 0;
            $package->d = 0;
            $package->is_publish = '1';
            $package->url = Str::slug($request->title);
            $cekUrl = Package::where('url',$package->url)->first();
            if($cekUrl){
                $package->url = $package->url."-".time();
            }
            $package->save();

            // Handle cover photo
            if($request->photos['coverPhoto']) {
                $coverPhoto = $request->photos['coverPhoto'];
                
                if($coverPhoto['is_from_library'] && $coverPhoto['id']) {
                    // Photo from library - just create reference
                    $packageBanner = new PackageBanner();
                    $packageBanner->package_id = $package->id;
                    $packageBanner->gallery_id = $coverPhoto['id'];
                    $packageBanner->save();
                } 
                elseif(!$coverPhoto['is_from_library'] && $coverPhoto['data']) {
                    // Handle uploaded cover photo
                    $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $coverPhoto['data']));
                    
                    // Generate a unique filename
                    $filename = 'package_' . $package->id . '_cover_' . time() . '.jpg';
                    
                    // Store the image in assets/destinations directory
                    // Storage::disk('public')->put('assets/destinations/' . $filename, $imageData);
                    
                    // Create a new gallery entry
                    $gallery = new Gallery();
                    $gallery->destination_id = $coverPhoto['destination_id'];
                    $gallery->image = $filename;
                    $gallery->caption = $coverPhoto['caption'];
                    $gallery->alt_text = $coverPhoto['alt_text'];
                    $gallery->save();
                    
                    // Link the new gallery item to the package
                    $packageBanner = new PackageBanner();
                    $packageBanner->package_id = $package->id;
                    $packageBanner->gallery_id = $gallery->id;
                    $packageBanner->save();
                }
            }

            // Handle gallery photos
            if($request->photos['galleryPhotos']) {
                foreach ($request->photos['galleryPhotos'] as $key => $galleryPhoto) {
                    if($galleryPhoto['is_from_library'] && $galleryPhoto['id']) {
                        // Photo from library - just create reference
                        $packageBanner = new PackageBanner();
                        $packageBanner->package_id = $package->id;
                        $packageBanner->gallery_id = $galleryPhoto['id'];
                        $packageBanner->save();
                    }
                    elseif(!$galleryPhoto['is_from_library'] && $galleryPhoto['data']) {
                        // Handle uploaded gallery photo
                        $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $galleryPhoto['data']));
                        
                        // Generate a unique filename
                        $filename = 'package_' . $package->id . '_gallery_' . $key . '_' . time() . '.jpg';
                        
                        // Store the image in assets/destinations directory
                        // Storage::disk('public')->put('assets/destinations/' . $filename, $imageData);
                        
                        // Create a new gallery entry
                        $gallery = new Gallery();
                        $gallery->destination_id = $galleryPhoto['destination_id'];
                        $gallery->image = $filename;
                        $gallery->caption = $galleryPhoto['caption'];
                        $gallery->alt_text = $galleryPhoto['alt_text'];
                        $gallery->save();
                        
                        // Link the new gallery item to the package
                        $packageBanner = new PackageBanner();
                        $packageBanner->package_id = $package->id;
                        $packageBanner->gallery_id = $gallery->id;
                        $packageBanner->save();
                    }
                }
            }

            $allDestinations = [];
            $totalMeals = [
                'breakfast' => 0,
                'lunch' => 0,
                'dinner' => 0,
            ];
            $arrHotels = [];
            foreach ($request->itinerary as $key => $value) {
                $itinerary = new Itinerary();
                $itinerary->package_id = $package->id;
                $itinerary->day = $value['day'];
                $itinerary->title = $value['title'];
                $itinerary->activity = $value['description'];
                $itinerary->save();
                $arrHotels[$key] = [
                    'day' => $value['day'],
                    'hotel_id' => null,
                ];

                $arrDestination[$key] = [];
                $arrMeals[$key] = [
                    'breakfast' => 0,
                    'lunch' => 0,
                    'dinner' => 0,
                ];
                foreach($value['activities'] as $index => $item){
                    if($item['type_id'] === 2){
                        $getDestination = Activity::find($item['activity_id']);
                        array_push($arrDestination[$key], $getDestination->destination_id);
                        if(!in_array($getDestination->destination_id, $allDestinations)){
                            array_push($allDestinations, $getDestination->destination_id);
                        }
                    }
                    if($item['type_id'] === 4){
                        if($item['activity_id'] === 9 && $item['include']){
                            $arrMeals[$key]['breakfast'] = 1;
                        }
                        if($item['activity_id'] === 2 && $item['include']){
                            $arrMeals[$key]['lunch'] = 1;
                        }
                        if($item['activity_id'] === 4 && $item['include']){
                            $arrMeals[$key]['dinner'] = 1;
                        }
                    }
                    $no = $index + 1;
                    $itineraryDetail = new ItineraryDetail();
                    $itineraryDetail->itinerary_id = $itinerary->id;
                    $itineraryDetail->no = $no;
                    $itineraryDetail->time = $item['time'];
                    if($item['type_id'] === 3){
                        $itineraryDetail->activity_id = 3;
                        $arrHotels[$key]['hotel_id'] = $item['activity_id'];
                    }
                    else{
                        $itineraryDetail->activity_id = $item['activity_id'];
                    }
                    $itineraryDetail->notes = $item['notes'];
                    $itineraryDetail->save();
                }

                if($value['day'] == 1 && count($arrDestination[$key]) == 0){
                    array_push($arrDestination[$key], $request->departure_id);
                }

                if($value['day'] == $request->duration && count($arrDestination[$key]) == 0){
                    array_push($arrDestination[$key], $request->return_id);
                }

                // Sum up the meals
                $totalMeals['breakfast'] += $arrMeals[$key]['breakfast'];
                $totalMeals['lunch'] += $arrMeals[$key]['lunch'];
                $totalMeals['dinner'] += $arrMeals[$key]['dinner'];

                $itineraryDestination = new ItineraryDestination();
                $itineraryDestination->package_id = $package->id;
                $itineraryDestination->itinerary_id = $itinerary->id;
                if(reset($arrDestination[$key])){
                    $itineraryDestination->destination_id = reset($arrDestination[$key]);
                }
                if(count($arrDestination[$key]) > 1){
                    $lastDestination = end($arrDestination[$key]);
                    $itineraryDestination->second_destination_id = $lastDestination;
                }
                $itineraryDestination->save();


                $itineraryMeals = new ItineraryMeal();
                $itineraryMeals->itinerary_id = $itinerary->id;
                $itineraryMeals->price_plan_id = 2;
                $itineraryMeals->breakfast = (string) $arrMeals[$key]['breakfast'];
                $itineraryMeals->lunch = (string) $arrMeals[$key]['lunch'];
                $itineraryMeals->dinner = (string) $arrMeals[$key]['dinner'];
                $itineraryMeals->save();
            }
            foreach ($allDestinations as $key => $value) {
                if($value){
                    $packageDestination = new PackageDestination();
                    $packageDestination->package_id = $package->id;
                    $packageDestination->destination_id = $value;
                    $packageDestination->save();
                }
            }
            
            $packageMeal = new PackageMeal();
            $packageMeal->package_id = $package->id;
            $packageMeal->price_plan_id = 2;
            $packageMeal->breakfast = $totalMeals['breakfast'];
            $packageMeal->lunch = $totalMeals['lunch'];
            $packageMeal->dinner = $totalMeals['dinner'];
            $packageMeal->save();

            $package->b = $packageMeal->breakfast;
            $package->l = $packageMeal->lunch;
            $package->d = $packageMeal->dinner;
            $package->save();
            
            foreach ($arrHotels as $key => $value) {
                if($value['hotel_id']){
                    $packageHotel = new PackageHotel();
                    $packageHotel->package_id = $package->id;
                    $packageHotel->price_plan_id = 2;
                    $packageHotel->hotel_id = $value['hotel_id'];
                    $packageHotel->day = $value['day'];
                    $packageHotel->save();
                }
            }

            foreach ($request->pricing as $key => $value) {
                $cekPrice = PriceCategory::where('start',$value['start_pax']);
                if($value['is_unlimited']){
                    $end = 0;
                    $textEnd = "+ Pax";
                }
                else{
                    $end = $value['end_pax'];
                    if($value['start_pax'] == $value['end_pax']){
                        $textEnd = " Pax";
                    }
                    else{
                        $textEnd = " - ".$value['end_pax']." Pax";
                    }
                }
                $cekPrice = $cekPrice->where('end',$end)->first();
                if(!$cekPrice){
                    $cekPrice = new PriceCategory();
                    $cekPrice->temp_text = $value['start_pax'].$textEnd;
                    $cekPrice->start = $value['start_pax'];
                    $cekPrice->end = $end;
                    $cekPrice->save();
                }

                $packagePrice = new PackagePrice();
                $packagePrice->package_id = $package->id;
                $packagePrice->price_plan_id = 2;
                $packagePrice->price_category_id = $cekPrice->id;
                $packagePrice->price = str_replace('.','',$value['price']);
                $packagePrice->save();
            }
            DB::commit();
           
        } catch (\Exception $e) {
            DB::rollBack();
        
            // Log the error for debugging
            \Log::error('Package creation error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            // Return error response
            return response()->json([
                'success' => false,
                'message' => 'Failed to create package',
                'error' => $e->getMessage(),
                'debug' => app()->environment('production') ? null : $e->getTraceAsString()
            ], 500);
        }
    }

    function update(Request $request,$id){
        try {
            DB::beginTransaction();
            // return $request->all();
            $package = Package::findOrFail($id);
            $package->name = $request->title;
            $package->start_destination_id = $request->departure_id;
            $package->end_destination_id = $request->return_id;
            $package->overview = $request->selling_points;
            $package->short_description = $request->selling_points;
            $package->save();

            // Handle cover photo
            PackageBanner::where('package_id', $package->id)->delete();
            if($request->photos['coverPhoto']) {
                $coverPhoto = $request->photos['coverPhoto'];
                
                if($coverPhoto['is_from_library'] && $coverPhoto['id']) {
                    // Photo from library - just create reference
                    $packageBanner = new PackageBanner();
                    $packageBanner->package_id = $package->id;
                    $packageBanner->gallery_id = $coverPhoto['id'];
                    $packageBanner->save();
                } 
                elseif(!$coverPhoto['is_from_library'] && $coverPhoto['data']) {
                    // Handle uploaded cover photo
                    $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $coverPhoto['data']));
                    
                    // Generate a unique filename
                    $filename = 'package_' . $package->id . '_cover_' . time() . '.jpg';
                    
                    // Store the image in assets/destinations directory
                    // Storage::disk('public')->put('assets/destinations/' . $filename, $imageData);
                    
                    // Create a new gallery entry
                    $gallery = new Gallery();
                    $gallery->destination_id = $coverPhoto['destination_id'];
                    $gallery->image = $filename;
                    $gallery->caption = $coverPhoto['caption'];
                    $gallery->alt_text = $coverPhoto['alt_text'];
                    $gallery->save();
                    
                    // Link the new gallery item to the package
                    $packageBanner = new PackageBanner();
                    $packageBanner->package_id = $package->id;
                    $packageBanner->gallery_id = $gallery->id;
                    $packageBanner->save();
                }
            }

            // Handle gallery photos
            if($request->photos['galleryPhotos']) {
                foreach ($request->photos['galleryPhotos'] as $key => $galleryPhoto) {
                    if($galleryPhoto['is_from_library'] && $galleryPhoto['id']) {
                        // Photo from library - just create reference
                        $packageBanner = new PackageBanner();
                        $packageBanner->package_id = $package->id;
                        $packageBanner->gallery_id = $galleryPhoto['id'];
                        $packageBanner->save();
                    }
                    elseif(!$galleryPhoto['is_from_library'] && $galleryPhoto['data']) {
                        // Handle uploaded gallery photo
                        $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $galleryPhoto['data']));
                        
                        // Generate a unique filename
                        $filename = 'package_' . $package->id . '_gallery_' . $key . '_' . time() . '.jpg';
                        
                        // Store the image in assets/destinations directory
                        // Storage::disk('public')->put('assets/destinations/' . $filename, $imageData);
                        
                        // Create a new gallery entry
                        $gallery = new Gallery();
                        $gallery->destination_id = $galleryPhoto['destination_id'];
                        $gallery->image = $filename;
                        $gallery->caption = $galleryPhoto['caption'];
                        $gallery->alt_text = $galleryPhoto['alt_text'];
                        $gallery->save();
                        
                        // Link the new gallery item to the package
                        $packageBanner = new PackageBanner();
                        $packageBanner->package_id = $package->id;
                        $packageBanner->gallery_id = $gallery->id;
                        $packageBanner->save();
                    }
                }
            }

            $allDestinations = [];
            $totalMeals = [
                'breakfast' => 0,
                'lunch' => 0,
                'dinner' => 0,
            ];
            $arrHotels = [];
            ItineraryDetail::whereHas('itinerary', function($query) use($package){
                $query->where('package_id',$package->id);
            })->delete();
            ItineraryDestination::where('package_id',$package->id)->delete();
            ItineraryMeal::whereHas('itinerary', function($query) use($package){
                $query->where('package_id',$package->id);
            })->delete();
            PackageDestination::where('package_id',$package->id)->delete();
            PackageMeal::where('package_id',$package->id)->delete();
            PackageHotel::where('package_id',$package->id)->delete();
            PackagePrice::where('package_id',$package->id)->delete();
            Itinerary::where('package_id',$package->id)->delete();
            foreach ($request->itinerary as $key => $value) {
                $itinerary = new Itinerary();
                $itinerary->package_id = $package->id;
                $itinerary->day = $value['day'];
                $itinerary->title = $value['title'];
                $itinerary->activity = $value['description'];
                $itinerary->save();
                $arrHotels[$key] = [
                    'day' => $value['day'],
                    'hotel_id' => null,
                ];

                $arrDestination[$key] = [];
                $arrMeals[$key] = [
                    'breakfast' => 0,
                    'lunch' => 0,
                    'dinner' => 0,
                ];
                foreach($value['activities'] as $index => $item){
                    if($item['type_id'] === 2){
                        $getDestination = Activity::find($item['activity_id']);
                        array_push($arrDestination[$key], $getDestination->destination_id);
                        if(!in_array($getDestination->destination_id, $allDestinations)){
                            array_push($allDestinations, $getDestination->destination_id);
                        }
                    }
                    if($item['type_id'] === 4){
                        if($item['activity_id'] === 9 && $item['include']){
                            $arrMeals[$key]['breakfast'] = 1;
                        }
                        if($item['activity_id'] === 2 && $item['include']){
                            $arrMeals[$key]['lunch'] = 1;
                        }
                        if($item['activity_id'] === 4 && $item['include']){
                            $arrMeals[$key]['dinner'] = 1;
                        }
                    }
                    $no = $index + 1;
                    $itineraryDetail = new ItineraryDetail();
                    $itineraryDetail->itinerary_id = $itinerary->id;
                    $itineraryDetail->no = $no;
                    $itineraryDetail->time = $item['time'];
                    if($item['type_id'] === 3){
                        $itineraryDetail->activity_id = 3;
                        $arrHotels[$key]['hotel_id'] = $item['activity_id'];
                    }
                    else{
                        $itineraryDetail->activity_id = $item['activity_id'];
                    }
                    $itineraryDetail->notes = $item['notes'];
                    $itineraryDetail->save();
                }

                if($value['day'] == 1 && count($arrDestination[$key]) == 0){
                    array_push($arrDestination[$key], $request->departure_id);
                }

                if($value['day'] == $request->duration && count($arrDestination[$key]) == 0){
                    array_push($arrDestination[$key], $request->return_id);
                }

                // Sum up the meals
                $totalMeals['breakfast'] += $arrMeals[$key]['breakfast'];
                $totalMeals['lunch'] += $arrMeals[$key]['lunch'];
                $totalMeals['dinner'] += $arrMeals[$key]['dinner'];

                $itineraryDestination = new ItineraryDestination();
                $itineraryDestination->package_id = $package->id;
                $itineraryDestination->itinerary_id = $itinerary->id;
                if(reset($arrDestination[$key])){
                    $itineraryDestination->destination_id = reset($arrDestination[$key]);
                }
                if(count($arrDestination[$key]) > 1){
                    $lastDestination = end($arrDestination[$key]);
                    $itineraryDestination->second_destination_id = $lastDestination;
                }
                $itineraryDestination->save();


                $itineraryMeals = new ItineraryMeal();
                $itineraryMeals->itinerary_id = $itinerary->id;
                $itineraryMeals->price_plan_id = 2;
                $itineraryMeals->breakfast = (string) $arrMeals[$key]['breakfast'];
                $itineraryMeals->lunch = (string) $arrMeals[$key]['lunch'];
                $itineraryMeals->dinner = (string) $arrMeals[$key]['dinner'];
                $itineraryMeals->save();
            }
            foreach ($allDestinations as $key => $value) {
                if($value){
                    $packageDestination = new PackageDestination();
                    $packageDestination->package_id = $package->id;
                    $packageDestination->destination_id = $value;
                    $packageDestination->save();
                }
            }
            
            $packageMeal = new PackageMeal();
            $packageMeal->package_id = $package->id;
            $packageMeal->price_plan_id = 2;
            $packageMeal->breakfast = $totalMeals['breakfast'];
            $packageMeal->lunch = $totalMeals['lunch'];
            $packageMeal->dinner = $totalMeals['dinner'];
            $packageMeal->save();

            $package->b = $packageMeal->breakfast;
            $package->l = $packageMeal->lunch;
            $package->d = $packageMeal->dinner;
            $package->save();
            
            foreach ($arrHotels as $key => $value) {
                if($value['hotel_id']){
                    $packageHotel = new PackageHotel();
                    $packageHotel->package_id = $package->id;
                    $packageHotel->price_plan_id = 2;
                    $packageHotel->hotel_id = $value['hotel_id'];
                    $packageHotel->day = $value['day'];
                    $packageHotel->save();
                }
            }

            foreach ($request->pricing as $key => $value) {
                $cekPrice = PriceCategory::where('start',$value['start_pax']);
                if($value['is_unlimited']){
                    $end = 0;
                    $textEnd = "+ Pax";
                }
                else{
                    $end = $value['end_pax'];
                    if($value['start_pax'] == $value['end_pax']){
                        $textEnd = " Pax";
                    }
                    else{
                        $textEnd = " - ".$value['end_pax']." Pax";
                    }
                }
                $cekPrice = $cekPrice->where('end',$end)->first();
                if(!$cekPrice){
                    $cekPrice = new PriceCategory();
                    $cekPrice->temp_text = $value['start_pax'].$textEnd;
                    $cekPrice->start = $value['start_pax'];
                    $cekPrice->end = $end;
                    $cekPrice->save();
                }

                $packagePrice = new PackagePrice();
                $packagePrice->package_id = $package->id;
                $packagePrice->price_plan_id = 2;
                $packagePrice->price_category_id = $cekPrice->id;
                $packagePrice->price = str_replace('.','',$value['price']);
                $packagePrice->save();
            }
            DB::commit();
           
        } catch (\Exception $e) {
            DB::rollBack();
        
            // Log the error for debugging
            \Log::error('Package update error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            // Return error response
            return response()->json([
                'success' => false,
                'message' => 'Failed to create package',
                'error' => $e->getMessage(),
                'debug' => app()->environment('production') ? null : $e->getTraceAsString()
            ], 500);
        }
    }

    function packageDetail()
    {
        return Inertia::render('Packages/TourLandingPage');
    }

    function flipbook($url)
    {
        return view('packages/flipbook2');
    }
}
