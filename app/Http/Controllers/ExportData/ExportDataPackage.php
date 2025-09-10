<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Package;
use App\Models\PackageBanner;
use App\Services\IncludeExcludeService;
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
        $package = Package::where('is_publish', '1')->orderBy('id', 'asc');
        if (request()->limit) {
            $package = $package->limit(request()->limit);
        }
        $package = $package
            ->get()
            ->map(function ($data) {
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
                    'total_breakfast' => $data->b,
                    'total_lunch' => $data->l,
                    'total_dinner' => $data->d,
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

    function packageIncludes(){
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
                    'item_include_id'=> $key + 1,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                    'deleted_at'     => null,
                ];
            }
        }
        $columns = ['id','package_id','item_exclude_id','created_at','updated_at','deleted_at'];
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
                    'item_exclude_id'=> $key + 1,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                    'deleted_at'     => null,
                ];
            }
        }
        $columns = ['id','package_id','item_exclude_id','created_at','updated_at','deleted_at'];
        return ExportCSV::export('package_excludes.csv', $columns, $export);
    }
}
