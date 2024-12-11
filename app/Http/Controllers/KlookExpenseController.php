<?php

namespace App\Http\Controllers;

use App\Models\DestinationActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KlookExpenseController extends Controller
{
    function index(Request $request) {
        $pageInfo = 'Klook Expense';
        $pageTitle = 'Klook Expense';

        return Inertia::render('KlookExpense/IndexTableModel2');
    }

}
