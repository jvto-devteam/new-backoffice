<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\Request;

class ExportDataCountries extends Controller
{
    function countries(){
        $countries = Country::orderBy('id','asc');
        
        if(request()->limit){
            $countries = $countries->limit(request()->limit);
        }
        $countries = $countries
        ->get(['id','short_name', 'long_name','dial_code','created_at','updated_at','deleted_at']);        
        $columns = ['id','short_name', 'long_name','dial_code','created_at','updated_at','deleted_at'];
        return ExportSQL::export('countries.csv', $columns, $countries->toArray());
    }
}
