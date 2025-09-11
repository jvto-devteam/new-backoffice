<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\AddOn;
use App\Models\AddOnPackage;
use App\Models\Category;
use App\Models\Package;
use App\Models\PackageBanner;
use App\Models\PackagePrice;
use App\Services\IncludeExcludeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExportDataPackage extends Controller
{
    function packageCategories()
    {
        $packageCategories = Category::whereIn('id', [1, 2])->orderBy('id', 'asc');
        if (request()->limit) {
            $packageCategories = $packageCategories->limit(request()->limit);
        }
        $packageCategories = $packageCategories
            ->get(['id', 'name', 'created_at', 'updated_at', DB::raw('NULL as deleted_at')])->toArray();
        $columns = ['id', 'name', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('package_categories.csv', $columns, $packageCategories);
    }
    function packages()
    {
        $package = Package::with(['itinerary.itineraryMeals' => function ($query) {
            $query->where('price_plan_id', 2);
        }])->where('is_publish', '1')->orderBy('id', 'asc');
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
                    'description' => $data->overview,
                    'duration_idr' => $data->duration_id,
                    'order_channel_id' => $data->package_platform == 'website' ? 1 : 3,
                    'package_category_id' => $data->category_id,
                    'start_destination_id' => $data->start_destination_id,
                    'end_destination_id' => $data->end_destination_id,
                    'key_highlights' => $data->key_highlights,
                    'ideal_arrival' => $data->ideal_arrival,
                    'physicallity' => $data->physicality,
                    'suitable_for' => $data->suitable_for,
                    'is_publish' => $data->is_publish,
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
        $columns = ['id', 'uuid', 'code', 'slug', 'description', 'duration_idr', 'order_channel_id', 'package_category_id', 'start_destination_id', 'end_destination_id', 'key_highlights', 'ideal_arrival', 'physicallity', 'suitable_for', 'is_publish', 'total_breakfast', 'total_lunch', 'total_dinner', 'google_merchant_product_id', 'meta_catalogue_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('packages.csv', $columns, $package);
    }
    function packageImages()
    {
        $images = PackageBanner::with('gallery.destinationGallery')->whereHas('package', function ($query) {
            $query->where('is_publish', '1');
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
        return ExportCSV::export('package_images.csv', $columns, $images);
    }

    function packageIncludes()
    {
        $package = Package::where('is_publish', '1')->orderBy('id', 'asc');
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
        $columns = ['id', 'package_id', 'item_exclude_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('package_includes.csv', $columns, $export);
    }

    function packageExcludes()
    {
        $package = Package::where('is_publish', '1')->orderBy('id', 'asc');
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
        return ExportCSV::export('package_excludes.csv', $columns, $export);
    }
    function packageAddons()
    {
        $packages = Package::with('packageDestination')->where('is_publish', '1')->orderBy('id', 'asc');

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
        return ExportCSV::export('package_addons.csv', $columns, $result);
    }
    function packagePrices()
    {
        $packagePrices = PackagePrice::with('package')->whereHas('package', function ($query) {
            $query->where('is_publish', '1');
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
        return ExportCSV::export('package_prices.csv', $columns, $packagePrices);
    }
    function packageItineraryDays() {
        
    }
}
