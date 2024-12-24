<?php

namespace App\Http\Controllers;

use App\Models\Flipbook;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FlipBookController extends Controller
{
    function index(){
        $data['flipbook'] = Flipbook::orderBy('title','asc')->get();
        Inertia::render('FlipBook/Index',['data' => $data]);
    }
}
