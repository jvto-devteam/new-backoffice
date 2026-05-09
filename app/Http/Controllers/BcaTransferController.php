<?php

namespace App\Http\Controllers;

use App\Models\BcaCrewTransfer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BcaTransferController extends Controller
{
    public function index(Request $request)
    {
        $query = BcaCrewTransfer::with('booking:id,booking_code,invoice_code_origin')
            ->orderBy('transfer_date', 'desc')
            ->orderBy('transfer_time', 'desc');

        if ($request->filled('date_from')) {
            $query->whereDate('transfer_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('transfer_date', '<=', $request->date_to);
        }

        $totalAmount = $query->sum('amount');
        $transfers   = $query->paginate(50)->withQueryString();

        return Inertia::render('Finance/BcaTransfers', [
            'transfers'   => $transfers,
            'totalAmount' => $totalAmount,
            'filters'     => $request->only(['date_from', 'date_to']),
        ]);
    }
}
