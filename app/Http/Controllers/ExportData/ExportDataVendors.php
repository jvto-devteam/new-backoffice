<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Http\Request;

class ExportDataVendors extends Controller
{
    function vendors(){
        $vendors = Vendor::orderBy('id', 'asc');
        if (request()->limit) {
            $vendors = $vendors->limit(request()->limit);
        }
        $vendors = $vendors
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'vendor_category_id' => $data->vendor_category_id,
                    'name' => $data->name,                    
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id', 'vendor_category_id','name', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('vendors.csv', $columns, $vendors);
    }
    function vendorCategories(){
        $vendorCategories = VendorCategory::orderBy('id', 'asc');
        if (request()->limit) {
            $vendorCategories = $vendorCategories->limit(request()->limit);
        }
        $vendorCategories = $vendorCategories
            ->get()->map(function ($data) {
                return [
                    'id' => $data->id,
                    'name' => $data->name,                    
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => $data->deleted_at,
                ];
            })->toArray();
        $columns = ['id','name', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('vendor_categories.csv', $columns, $vendorCategories);
    }
}
