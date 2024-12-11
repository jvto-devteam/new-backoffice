<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    function index($orderCHannel){
        $data['package'] = Package::with('duration')
        ->where('is_publish', '1')
        ->get()
        ->sortBy(fn($package) => $package->duration->day);
        $data['title'] = strtoupper($orderCHannel)." Packages";
        return Inertia::render('Packages/Index',['data' => $data]);
    }
}
