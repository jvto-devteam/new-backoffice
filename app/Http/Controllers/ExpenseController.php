<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    function expensePackage(){
        return Inertia::render('Expense/ExpensePackage');
    }
}
