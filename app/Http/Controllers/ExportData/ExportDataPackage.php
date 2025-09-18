<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\AddOn;
use App\Models\AddOnPackage;
use App\Models\Category;
use App\Models\Itinerary;
use App\Models\ItineraryDetail;
use App\Models\Package;
use App\Models\PackageActivity;
use App\Models\PackageBanner;
use App\Models\PackageDestination;
use App\Models\PackageHotel;
use App\Models\PackagePrice;
use App\Services\IncludeExcludeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExportDataPackage extends Controller
{
    protected array $packageIds;
    public function __construct()
    {
        $this->packageIds = [73, 48, 47, 29, 28, 85, 65, 86, 91, 63, 80, 32, 33, 34, 54, 56, 43, 55, 74, 82, 83, 84];
    }

    function packageCategories()
    {
        $packageCategories = Category::whereIn('id', [1, 2])->orderBy('id', 'asc');
        if (request()->limit) {
            $packageCategories = $packageCategories->limit(request()->limit);
        }
        $packageCategories = $packageCategories
            ->get(['id', 'name', 'created_at', 'updated_at', DB::raw('NULL as deleted_at')])->toArray();
        $columns = ['id', 'name', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('package_categories.csv', $columns, $packageCategories);
    }
    function packages()
    {
        $package = Package::with(['itinerary.itineraryMeals' => function ($query) {
            $query->where('price_plan_id', 2);
        }])->whereIn('id', $this->packageIds)->orderBy('id', 'asc');
        if (request()->limit) {
            $package = $package->limit(request()->limit);
        }
        $package = $package
            ->get()
            ->map(function ($data) {
                $totalBreakfast = 0;
                $totalLunch = 0;
                $totalDinner = 0;

                foreach ($data->itinerary as $itinerary) {
                    foreach ($itinerary->itineraryMeals as $meal) {
                        $totalBreakfast += (int) $meal->breakfast;
                        $totalLunch    += (int) $meal->lunch;
                        $totalDinner   += (int) $meal->dinner;
                    }
                }
                return [
                    'id' => $data->id,
                    'uuid' => $data->uuid,
                    'code' => $data->package_code,
                    'slug' => $data->url,
                    'name' => $data->name,
                    'description' => $data->overview,
                    'duration_id' => $data->duration_id,
                    'order_channel_id' => $data->package_platform == 'website' ? 1 : 3,
                    'package_category_id' => $data->category_id,
                    'start_destination_id' => $data->start_destination_id,
                    'end_destination_id' => $data->end_destination_id,
                    'key_highlights' => $data->key_highlights,
                    'ideal_arrival' => $data->ideal_arrival,
                    'physicality' => $data->physicality,
                    'suitable_for' => $data->suitable_for,
                    'is_publish' => $data->is_publish == '1' ? true : false,
                    'total_breakfast' => $totalBreakfast,
                    'total_lunch' => $totalLunch,
                    'total_dinner' => $totalDinner,
                    'google_merchant_product_id' => $data->google_merchant_product_id,
                    'meta_catalogue_id' => $data->meta_catalogue_id,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'uuid', 'code', 'slug','name', 'description', 'duration_id', 'order_channel_id', 'package_category_id', 'start_destination_id', 'end_destination_id', 'key_highlights', 'ideal_arrival', 'physicality', 'suitable_for', 'is_publish', 'total_breakfast', 'total_lunch', 'total_dinner', 'google_merchant_product_id', 'meta_catalogue_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('packages.csv', $columns, $package);
    }
    function packageImages()
    {
        $images = PackageBanner::with('gallery.destinationGallery')->whereHas('package', function ($query) {
            $query->whereIn('id', $this->packageIds);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $images = $images->limit(request()->limit);
        }
        $images = $images
            ->get()
            ->map(function ($data) use (&$sortCounters) {
                $pid = $data->package_id;

                if (!isset($sortCounters[$pid])) {
                    $sortCounters[$pid] = 0;
                }

                $sortCounters[$pid]++;
                return [
                    'id' => $data->id,
                    'package_id' => $data->package_id,
                    'url' => '/img/destinations/' . $data->gallery->image,
                    'sort_order' => $sortCounters[$pid],
                    'alt_text' => $data->gallery->alt_text,
                    'caption' => $data->gallery->caption,
                    'tags' => $data->gallery->destinationGallery?->name,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => null,
                ];
            })->toArray();
        $columns = ['id', 'package_id', 'url', 'sort_order', 'alt_text', 'caption', 'tags', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('package_images.csv', $columns, $images);
    }

    function packageIncludes()
    {
        $package = Package::whereIn('id', $this->packageIds)->orderBy('id', 'asc');
        if (request()->limit) {
            $package = $package->limit(request()->limit);
        }
        $packages = $package->get();

        $includes = IncludeExcludeService::getIncludes();

        $export = [];
        $id = 1;

        foreach ($packages as $pkg) {
            foreach ($includes as $key => $item) {
                $export[] = [
                    'id'             => $id++,
                    'package_id'     => $pkg->id,
                    'item_include_id' => $key + 1,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                    'deleted_at'     => null,
                ];
            }
        }
        $columns = ['id', 'package_id', 'item_include_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('package_includes.csv', $columns, $export);
    }

    function packageExcludes()
    {
        $package = Package::whereIn('id', $this->packageIds)->orderBy('id', 'asc');
        if (request()->limit) {
            $package = $package->limit(request()->limit);
        }
        $packages = $package->get();

        $excludes = IncludeExcludeService::getExcludes();

        $export = [];
        $id = 1;

        foreach ($packages as $pkg) {
            foreach ($excludes as $key => $item) {
                $export[] = [
                    'id'             => $id++,
                    'package_id'     => $pkg->id,
                    'item_exclude_id' => $key + 1,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                    'deleted_at'     => null,
                ];
            }
        }
        $columns = ['id', 'package_id', 'item_exclude_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('package_excludes.csv', $columns, $export);
    }
    function packageAddons()
    {
        $packages = Package::with('packageDestination')->whereIn('id', $this->packageIds)->orderBy('id', 'asc');

        if (request()->limit) {
            $packages = $packages->limit(request()->limit);
        }
        $packages = $packages->get();

        $result = [];
        $now = Carbon::now();
        $idCounter = 1; // mulai id dari 1

        // ambil semua addon transport sekali saja
        $transportAddOns = AddOn::where('is_transport', '1')->pluck('id');
        foreach ($packages as $package) {
            // ambil semua destination_id dari relasi
            $destinations = $package->packageDestination->pluck('destination_id')->toArray();

            // 1) cek kondisi: ada 1, tidak ada 6
            if (in_array(1, $destinations) && !in_array(6, $destinations)) {
                $result[] = [
                    'id' => $idCounter++,
                    'package_id' => $package->id,
                    'addon_id' => 2,
                    'created_at' => $now,
                    'updated_at' => $now,
                    'deleted_at' => null,
                ];
            }

            // 2) cek kondisi end_destination_id == 3
            if ($package->end_destination_id == 3) {
                foreach ($transportAddOns as $addonId) {
                    $result[] = [
                        'id' => $idCounter++,
                        'package_id' => $package->id,
                        'addon_id' => $addonId,
                        'created_at' => $now,
                        'updated_at' => $now,
                        'deleted_at' => null,
                    ];
                }
            }
        }
        $columns = ['id', 'package_id', 'addon_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('package_addons.csv', $columns, $result);
    }
    function packagePrices()
    {
        $packagePrices = PackagePrice::with('package')->whereHas('package', function ($query) {
            $query->whereIn('id', $this->packageIds);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $packagePrices = $packagePrices->limit(request()->limit);
        }
        $packagePrices = $packagePrices
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'package_id' => $data->package_id,
                    'price_tier_id' => $data->price_category_id,
                    'price' => (int)$data->price,
                    'klook_retail_price' => (int)$data->klook_retail_price,
                    'klook_net_price' => (int)$data->klook_net_price,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'package_id', 'price_tier_id', 'price', 'klook_retail_price', 'klook_net_price', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('package_prices.csv', $columns, $packagePrices);
    }
    function packageItineraryDays()
    {
        $itinerary = Itinerary::with(['package.packageHotel' => function ($query) {
            $query->where('price_plan_id', 2);
        }, 'itineraryMeals' => function ($query) {
            $query->where('price_plan_id', 2);
        }])->whereHas('package', function ($query) {
            $query->whereIn('id', $this->packageIds);
        })->orderBy('id', 'asc');

        if (request()->limit) {
            $itinerary = $itinerary->limit(request()->limit);
        }
        $itinerary = $itinerary
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'package_id' => $data->package_id,
                    'day_no' => $data->day,
                    'activity_start_id' => $data->activity_start_id,
                    'activity_end_id' => $data->activity_end_id,
                    'title' => $data->title,
                    'activity' => $data->activity,
                    'hotel_id' => $data->package->packageHotel->where('day', $data->day)->first()->hotel_id ?? null,
                    'meal_breakfast' => $data->itineraryMeals[0]->breakfast == '1' ? true : false,
                    'meal_lunch' => $data->itineraryMeals[0]->lunch == '1' ? true : false,
                    'meal_dinner' => $data->itineraryMeals[0]->dinner == '1' ? true : false,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'package_id', 'day_no', 'activity_start_id', 'activity_end_id', 'title', 'activity', 'hotel_id', 'meal_breakfast', 'meal_lunch', 'meal_dinner', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('package_itinerary_days.csv', $columns, $itinerary);
    }

    function packageItineraryDayDetails()
    {
        $itineraryDetails = ItineraryDetail::with('itinerary')->whereHas('itinerary.package', function ($query) {
            $query->whereIn('id', $this->packageIds);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $itineraryDetails = $itineraryDetails->limit(request()->limit);
        }
        $itineraryDetails = $itineraryDetails
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'itinerary_day_id' => $data->itinerary_id,
                    'sort_order' => $data->no,
                    'time' => $data->time,
                    'activity_id' => $data->activity_id,
                    'notes' => $data->notes,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'itinerary_day_id', 'sort_order', 'time', 'activity_id', 'notes', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('package_itinerary_day_details.csv', $columns, $itineraryDetails);
    }

    function packageDestinations()
    {
        $packageDestination = PackageDestination::with('package')->whereHas('package', function ($query) {
            $query->whereIn('id', $this->packageIds);
        })->orderBy('id', 'asc');
        if (request()->limit) {
            $packageDestination = $packageDestination->limit(request()->limit);
        }
        $packageDestination = $packageDestination->get()->map(function ($data) {
            return [
                'id' => $data->id,
                'package_id' => $data->package_id,
                'destination_id' => $data->destination_id,
                'sort_order' => 0,
                'created_at' => $data->created_at,
                'updated_at' => $data->updated_at,
                'deleted_at' => $data->deleted_at,
            ];
        })->toArray();
        $columns = ['id', 'package_id', 'destination_id', 'sort_order', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('package_destinations.csv', $columns, $packageDestination);
    }

    function packageHotelOptions()
    {
        $packageHotelOptions = PackageHotel::with('package')->whereHas('package', function ($query) {
            $query->whereIn('id', $this->packageIds);
        })->where('price_plan_id', 2)->orderBy('id', 'asc');
        if (request()->limit) {
            $packageHotelOptions = $packageHotelOptions->limit(request()->limit);
        }
        $packageHotelOptions = $packageHotelOptions
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'package_id' => $data->package_id,
                    'day_no' => $data->day,
                    'hotel_id' => $data->hotel_id,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'package_id', 'day_no', 'hotel_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('package_hotel_options.csv', $columns, $packageHotelOptions);
    }

    function combinedPackages()
    {
        $combinedPackages = PackageActivity::where('is_single', '0')->orderBy('id', 'asc');
        if (request()->limit) {
            $combinedPackages = $combinedPackages->limit(request()->limit);
        }
        $combinedPackages = $combinedPackages
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'name' => $data->name,
                    'long_name' => $data->long_name,
                    'slug' => $data->url,
                    'highlights' => $data->highlights,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'name', 'long_name', 'slug', 'highlights', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('combined_packages.csv', $columns, $combinedPackages);
    }
    function combinedPackageDetails()
    {
        $data = [
            ['id' => 1, 'combined_package_id' => 1, 'package_id' => 28, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 2, 'combined_package_id' => 1, 'package_id' => 29, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 3, 'combined_package_id' => 1, 'package_id' => 32, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 4, 'combined_package_id' => 1, 'package_id' => 33, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 5, 'combined_package_id' => 1, 'package_id' => 56, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 6, 'combined_package_id' => 2, 'package_id' => 33, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 7, 'combined_package_id' => 2, 'package_id' => 29, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 8, 'combined_package_id' => 2, 'package_id' => 32, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 9, 'combined_package_id' => 3, 'package_id' => 29, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 10, 'combined_package_id' => 3, 'package_id' => 85, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 11, 'combined_package_id' => 3, 'package_id' => 28, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 12, 'combined_package_id' => 4, 'package_id' => 73, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 13, 'combined_package_id' => 5, 'package_id' => 48, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 14, 'combined_package_id' => 5, 'package_id' => 47, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 15, 'combined_package_id' => 6, 'package_id' => 63, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 16, 'combined_package_id' => 6, 'package_id' => 80, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 17, 'combined_package_id' => 8, 'package_id' => 54, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 18, 'combined_package_id' => 9, 'package_id' => 32, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 19, 'combined_package_id' => 9, 'package_id' => 33, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 20, 'combined_package_id' => 9, 'package_id' => 34, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 21, 'combined_package_id' => 12, 'package_id' => 56, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 22, 'combined_package_id' => 12, 'package_id' => 43, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
            ['id' => 23, 'combined_package_id' => 13, 'package_id' => 74, 'created_at' => null, 'updated_at' => null, 'deleted_at' => null],
        ];
        $columns = ['id', 'combined_package_id', 'package_id','created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('combined_package_details.csv', $columns, $data);
    }
}
