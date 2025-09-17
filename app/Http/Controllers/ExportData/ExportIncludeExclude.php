<?php

namespace App\Http\Controllers\ExportData;

use App\Services\IncludeExcludeService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ExportIncludeExclude extends Controller
{
    function include(){
        $include = IncludeExcludeService::getIncludes();
        $export = collect($include)->map(function($value, $key) {
            return [
                'id' => $key + 1,
                'item' => $value,
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ];
        })->toArray();
        $columns = ['id', 'item', 'created_at', 'updated_at', 'deleted_at'];
        return ExportSQL::export('item_includes.csv', $columns, $export);
    }

    function exclude(){
        $exclude = IncludeExcludeService::getExcludes();

        $export = collect($exclude)->map(function($value, $key) {
            return [
                'id' => $key + 1,
                'item' => $value,
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ];
        })->toArray();

        $columns = ['id','item','created_at','updated_at','deleted_at'];
        return ExportSQL::export('item_excludes.csv', $columns, $export);
    }
}
