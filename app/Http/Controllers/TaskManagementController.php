<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskManagementController extends Controller
{
    function index(Request $request) {
        $pageInfo = 'Task Management';
        $pageTitle = 'Task Management';

        return Inertia::render('TaskManagement/Index');
    }

    function calendar(Request $request) {


        return Inertia::render('Calendar/Calendar3');
    }
}
