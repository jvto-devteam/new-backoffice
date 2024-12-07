<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    function index(Request $request) {
        $pageInfo = 'Task Management';
        $pageTitle = 'Task Management';

        $status = $request->query('status');
        $tasks = Task::when($status, function ($query, $status) {
            return $query->where('status', $status);
        })->get();

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
        ]);
    }

    function calendar(Request $request) {


        return Inertia::render('Calendar/Calendar');
    }
}
