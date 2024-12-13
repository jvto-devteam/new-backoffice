<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    function index($orderCHannel){
        if($orderCHannel == 'jvto'){
            $data['packages'] = Package::with(['duration','category','startDestination','endDestination','packageBanner.gallery'])
            ->where('is_publish', '1')
            ->get()
            ->sortBy(fn($package) => $package->duration->day);
        }
        else{
            $data['packages'] = Package::with(['duration','category','startDestination','endDestination','packageBanner.gallery'])
            ->where('package_platform', 'klook')
            ->get()
            ->sortBy(fn($package) => $package->duration->day);
        }
        $data['order_channel'] = $orderCHannel;
        $data['title'] = strtoupper($orderCHannel)." Packages";
        return Inertia::render('Packages/Index',['data' => $data]);
    }
}
