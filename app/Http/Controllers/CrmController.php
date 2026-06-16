<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Country;
use App\Models\Package;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PDF;

class CrmController extends Controller
{
    // Klook = booking_category_id 3, JVTO = everything else (for agent_id=2)
    private function baseQuery(?string $channel = null)
    {
        $q = Booking::where('agent_id', 2)->where('status', 'booked');
        if ($channel === '1') {
            $q->where('booking_category_id', '!=', 3);
        } elseif ($channel === '2') {
            $q->where('booking_category_id', 3);
        }
        return $q;
    }

    private function applyDateFilter($query, Request $request)
    {
        if ($request->date_from && $request->date_to) {
            $query->whereBetween('created_at', [
                $request->date_from . ' 00:00:00',
                $request->date_to . ' 23:59:59',
            ]);
        } elseif ($request->year && $request->month) {
            $query->whereYear('created_at', $request->year)->whereMonth('created_at', $request->month);
        } elseif ($request->year) {
            $query->whereYear('created_at', $request->year);
        }
        return $query;
    }

    private function channelLabel(int $categoryId): string
    {
        return $categoryId == 3 ? 'KLOOK' : 'JVTO';
    }

    public function index()
    {
        $packages = Package::where('is_publish', '1')
            ->orWhere('package_platform', 'klook')
            ->orderBy('package_code')
            ->get(['id', 'package_code', 'name']);

        $countries = Country::orderBy('long_name')->get(['id', 'long_name']);

        $years = Booking::where('agent_id', 2)
            ->where('status', 'booked')
            ->selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return Inertia::render('CRM/Index', [
            'packages' => $packages,
            'countries' => $countries,
            'years' => $years,
        ]);
    }

    public function insights(Request $request)
    {
        $channel = $request->channel ?? null;

        $bookings = $this->applyDateFilter($this->baseQuery($channel), $request)
            ->with([
                'user.country',
                'bookingDetail.package' => fn($q) => $q->select('id', 'name', 'package_code'),
            ])
            ->get();

        $packagePopularity = $bookings
            ->groupBy(fn($b) => $b->bookingDetail->first()?->package_id ?? 0)
            ->map(fn($group) => [
                'package' => $group->first()->bookingDetail->first()?->package?->name ?? 'Unknown',
                'count' => $group->count(),
                'pax' => $group->sum('total_pax'),
                'revenue' => $group->sum('grand_total'),
            ])
            ->sortByDesc('count')
            ->values();

        $totalBookings = $bookings->count();
        $countryDistribution = $bookings
            ->groupBy(fn($b) => $b->user?->country?->long_name ?? 'Unknown')
            ->map(fn($group, $country) => [
                'country' => $country,
                'count' => $group->count(),
                'pax' => $group->sum('total_pax'),
                'revenue' => $group->sum('grand_total'),
                'percentage' => $totalBookings > 0 ? round($group->count() / $totalBookings * 100, 1) : 0,
            ])
            ->sortByDesc('count')
            ->values();

        $bookingTrend = $bookings
            ->groupBy(fn($b) => Carbon::parse($b->created_at)->format('Y-m'))
            ->map(fn($group, $month) => [
                'month' => $month,
                'count' => $group->count(),
                'pax' => $group->sum('total_pax'),
                'revenue' => $group->sum('grand_total'),
            ])
            ->sortKeys()
            ->values();

        $travelTrend = $bookings
            ->filter(fn($b) => $b->travel_date_start)
            ->groupBy(fn($b) => Carbon::parse($b->travel_date_start)->format('Y-m'))
            ->map(fn($group, $month) => [
                'month' => $month,
                'count' => $group->count(),
                'pax' => $group->sum('total_pax'),
                'revenue' => $group->sum('grand_total'),
            ])
            ->sortKeys()
            ->values();

        $jvtoBookings = $bookings->where('booking_category_id', '!=', 3);
        $klookBookings = $bookings->where('booking_category_id', 3);

        return response()->json([
            'package_popularity' => $packagePopularity,
            'country_distribution' => $countryDistribution,
            'booking_trend' => $bookingTrend,
            'travel_trend' => $travelTrend,
            'summary' => [
                'total_bookings' => $bookings->count(),
                'total_pax' => $bookings->sum('total_pax'),
                'total_revenue' => $bookings->sum('grand_total'),
                'unique_countries' => $bookings->pluck('user.country.long_name')->filter()->unique()->count(),
                'jvto_count' => $jvtoBookings->count(),
                'klook_count' => $klookBookings->count(),
            ],
        ]);
    }

    public function customers(Request $request)
    {
        $channel = $request->channel ?? null;
        $search = $request->search;
        $country = $request->country;
        $package = $request->package;

        $query = $this->applyDateFilter($this->baseQuery($channel), $request)
            ->select('id', 'booking_category_id', 'user_id', 'total_pax', 'travel_date_start', 'grand_total', 'payment', 'balance', 'special_requirements', 'created_at')
            ->with([
                'user.country',
                'bookingDetail.package' => fn($q) => $q->select('id', 'name', 'package_code'),
            ]);

        if ($search) {
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
            );
        }
        if ($country) {
            $query->whereHas('user.country', fn($q) => $q->where('id', $country));
        }
        if ($package) {
            $query->whereHas('bookingDetail', fn($q) => $q->where('package_id', $package));
        }

        $perPage = in_array((int) $request->per_page, [10, 20, 50, 100]) ? (int) $request->per_page : 20;
        $customers = $query->orderBy('created_at', 'desc')->paginate($perPage)->through(fn($b) => $this->formatCustomerRow($b));

        return response()->json($customers);
    }

    private function formatCustomerRow($b): array
    {
        return [
            'id' => $b->id,
            'user_id' => $b->user_id,
            'name' => $b->user?->name ?? '-',
            'first_name' => $b->user?->first_name ?: (explode(' ', $b->user?->name ?? ' ')[0] ?? ''),
            'last_name' => $b->user?->last_name ?: (str_contains($b->user?->name ?? '', ' ') ? implode(' ', array_slice(explode(' ', $b->user?->name ?? ''), 1)) : ''),
            'email' => $b->user?->email ?? '-',
            'phone' => $b->user?->phone ?? '-',
            'country' => $b->user?->country?->long_name ?? '-',
            'channel' => $this->channelLabel($b->booking_category_id),
            'package' => $b->bookingDetail->first()?->package?->name ?? '-',
            'package_code' => $b->bookingDetail->first()?->package?->package_code ?? '-',
            'booking_date' => $b->created_at ? Carbon::parse($b->created_at)->format('Y-m-d') : '-',
            'travel_date' => $b->travel_date_start ?? '-',
            'total_pax' => $b->total_pax ?? 0,
            'grand_total' => $b->grand_total ?? 0,
            'payment' => $b->payment ?? 0,
            'balance' => $b->balance ?? 0,
            'payment_status' => $b->payment == 0 ? 'Unpaid' : ($b->balance <= 0 ? 'Paid' : 'DP Paid'),
            'special_requirements' => $b->special_requirements ?? '-',
        ];
    }

    public function customerProfile(int $id)
    {
        $booking = Booking::with([
            'user.country',
            'user.waChatSummaries' => fn($q) => $q->orderBy('date', 'desc')->limit(10),
            'user.waChatSummaries.category',
            'bookingDetail.package' => fn($q) => $q->select('id', 'name', 'package_code'),
            'bookingPayment.paymentMethod',
            'bookAddOn.addOn',
        ])->findOrFail($id);

        return response()->json([
            'id' => $booking->id,
            'name' => $booking->user?->name ?? '-',
            'first_name' => $booking->user?->first_name,
            'last_name' => $booking->user?->last_name,
            'email' => $booking->user?->email ?? '-',
            'phone' => $booking->user?->phone ?? '-',
            'country' => $booking->user?->country?->long_name ?? '-',
            'channel' => $this->channelLabel($booking->booking_category_id),
            'package' => $booking->bookingDetail->first()?->package?->name ?? '-',
            'package_code' => $booking->bookingDetail->first()?->package?->package_code ?? '-',
            'booking_date' => $booking->created_at ? Carbon::parse($booking->created_at)->format('Y-m-d') : '-',
            'travel_date' => $booking->travel_date_start ?? '-',
            'total_pax' => $booking->total_pax ?? 0,
            'grand_total' => $booking->grand_total ?? 0,
            'payment' => $booking->payment ?? 0,
            'balance' => $booking->balance ?? 0,
            'payment_status' => $booking->payment == 0 ? 'Unpaid' : ($booking->balance <= 0 ? 'Paid' : 'DP Paid'),
            'special_requirements' => $booking->special_requirements ?? '-',
            'payments' => $booking->bookingPayment->map(fn($p) => [
                'method' => $p->paymentMethod?->name ?? '-',
                'paid_date' => $p->paid_date,
                'inv_date' => $p->inv_date,
            ]),
            'add_ons' => $booking->bookAddOn->map(fn($a) => [
                'name' => $a->addOn?->add_on ?? '-',
                'qty' => $a->qty,
                'price' => $a->price,
            ]),
            'wa_summaries' => $booking->user?->waChatSummaries?->map(fn($s) => [
                'date' => $s->date,
                'summary' => $s->summary,
                'category' => $s->category?->name ?? '-',
                'chat_count' => $s->chat_count,
            ]) ?? [],
        ]);
    }

    private function buildExportQuery(Request $request)
    {
        $channel = $request->channel ?? null;
        $country = $request->country;
        $package = $request->package;
        $search = $request->search;

        $query = $this->applyDateFilter($this->baseQuery($channel), $request)
            ->with([
                'user.country',
                'bookingDetail.package' => fn($q) => $q->select('id', 'name', 'package_code'),
                'bookAddOn.addOn',
            ])
            ->select('id', 'booking_category_id', 'user_id', 'total_pax', 'travel_date_start', 'grand_total', 'payment', 'balance', 'special_requirements', 'created_at');

        if ($search) {
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
            );
        }
        if ($country) {
            $query->whereHas('user.country', fn($q) => $q->where('id', $country));
        }
        if ($package) {
            $query->whereHas('bookingDetail', fn($q) => $q->where('package_id', $package));
        }

        return $query->orderBy('created_at', 'desc');
    }

    public function exportCustomers(Request $request)
    {
        $customers = $this->buildExportQuery($request)->get()->map(fn($b) => [
            'Booking ID' => $b->id,
            'Name' => $b->user?->name ?? '-',
            'Email' => $b->user?->email ?? '-',
            'Phone' => "'" . ($b->user?->phone ?? '-'),
            'Country' => $b->user?->country?->long_name ?? '-',
            'Channel' => $this->channelLabel($b->booking_category_id),
            'Package' => $b->bookingDetail->first()?->package?->name ?? '-',
            'Package Code' => $b->bookingDetail->first()?->package?->package_code ?? '-',
            'Booking Date' => $b->created_at ? Carbon::parse($b->created_at)->format('Y-m-d') : '-',
            'Travel Date' => $b->travel_date_start ?? '-',
            'Pax' => $b->total_pax ?? 0,
            'Grand Total' => $b->grand_total ?? 0,
            'Payment' => $b->booking_category_id != 3 ? ($b->payment ?? 0) : '-',
            'Balance' => $b->booking_category_id != 3 ? ($b->balance ?? 0) : '-',
            'Payment Status' => $b->booking_category_id != 3 ? ($b->payment == 0 ? 'Unpaid' : ($b->balance <= 0 ? 'Paid' : 'DP Paid')) : '-',
            'Add-ons' => $b->bookAddOn->map(fn($a) => ($a->addOn?->add_on ?? '-') . ' x' . $a->qty)->implode(', ') ?: '-',
            'Special Requirements' => $b->special_requirements ?? '-',
        ]);

        if ($request->format === 'pdf') {
            $title = 'Customer Report';
            $period = $this->buildPeriodLabel($request);
            ini_set('memory_limit', '512M');
            $pdf = PDF::loadView('exports.crm_customers_pdf', compact('customers', 'title', 'period'))
                ->setPaper('A4', 'landscape');
            return $pdf->download('customer_report_' . date('Y-m-d') . '.pdf');
        }

        $filename = 'customer_report_' . date('Y-m-d_His') . '.xls';
        header('Content-type: application/vnd-ms-excel');
        header("Content-Disposition: attachment; filename=$filename");
        return view('exports.crm_customers_excel', compact('customers'));
    }

    public function exportCountries(Request $request)
    {
        $channel = $request->channel ?? null;
        $bookings = $this->applyDateFilter($this->baseQuery($channel), $request)
            ->with('user.country')
            ->get();

        $countries = $bookings
            ->groupBy(fn($b) => $b->user?->country?->long_name ?? 'Unknown')
            ->map(fn($group, $country) => [
                'Country' => $country,
                'Bookings' => $group->count(),
                'Total Pax' => $group->sum('total_pax'),
                'Revenue (IDR)' => $group->sum('grand_total'),
            ])
            ->sortByDesc('Bookings')
            ->values();

        $period = $this->buildPeriodLabel($request);

        if ($request->format === 'pdf') {
            $pdf = PDF::loadView('exports.crm_countries_pdf', compact('countries', 'period'));
            return $pdf->download('customer_by_country_' . date('Y-m-d') . '.pdf');
        }

        $filename = 'customer_by_country_' . date('Y-m-d_His') . '.xls';
        header('Content-type: application/vnd-ms-excel');
        header("Content-Disposition: attachment; filename=$filename");
        return view('exports.crm_countries_excel', compact('countries', 'period'));
    }

    public function exportPackages(Request $request)
    {
        $channel = $request->channel ?? null;
        $bookings = $this->applyDateFilter($this->baseQuery($channel), $request)
            ->with(['bookingDetail.package' => fn($q) => $q->select('id', 'name', 'package_code')])
            ->get();

        $packages = $bookings
            ->groupBy(fn($b) => $b->bookingDetail->first()?->package_id ?? 0)
            ->map(fn($group) => [
                'Package' => $group->first()->bookingDetail->first()?->package?->name ?? 'Unknown',
                'Code' => $group->first()->bookingDetail->first()?->package?->package_code ?? '-',
                'Bookings' => $group->count(),
                'Total Pax' => $group->sum('total_pax'),
                'Revenue (IDR)' => $group->sum('grand_total'),
            ])
            ->sortByDesc('Bookings')
            ->values();

        $period = $this->buildPeriodLabel($request);

        if ($request->format === 'pdf') {
            $pdf = PDF::loadView('exports.crm_packages_pdf', compact('packages', 'period'));
            return $pdf->download('package_performance_' . date('Y-m-d') . '.pdf');
        }

        $filename = 'package_performance_' . date('Y-m-d_His') . '.xls';
        header('Content-type: application/vnd-ms-excel');
        header("Content-Disposition: attachment; filename=$filename");
        return view('exports.crm_packages_excel', compact('packages', 'period'));
    }

    public function exportCustomerReport(Request $request)
    {
        $channel = $request->channel ?? null;
        $country = $request->country;
        $package = $request->package;

        $query = $this->applyDateFilter($this->baseQuery($channel), $request)
            ->with([
                'user.country',
                'bookingDetail.package' => fn($q) => $q->select('id', 'name', 'package_code'),
            ])
            ->select('id', 'booking_category_id', 'user_id', 'total_pax', 'travel_date_start', 'grand_total', 'created_at');

        if ($country) {
            $query->whereHas('user.country', fn($q) => $q->where('id', $country));
        }
        if ($package) {
            $query->whereHas('bookingDetail', fn($q) => $q->where('package_id', $package));
        }

        $data = $query->get()->map(fn($b) => [
            'Email' => $b->user?->email ?? '',
            'Phone' => "'" . ($b->user?->phone ?? ''),
            'First Name' => $b->user?->first_name ?: (explode(' ', $b->user?->name ?? ' ')[0] ?? ''),
            'Last Name' => $b->user?->last_name ?: (str_contains($b->user?->name ?? '', ' ') ? implode(' ', array_slice(explode(' ', $b->user?->name ?? ''), 1)) : ''),
            'Country' => $b->user?->country?->long_name ?? '',
            'Booking Date' => $b->created_at ? Carbon::parse($b->created_at)->format('Y-m-d') : '',
            'Travel Date' => $b->travel_date_start ?? '',
            'Package' => $b->bookingDetail->first()?->package?->name ?? '',
            'Channel' => $this->channelLabel($b->booking_category_id),
            'Pax' => $b->total_pax ?? 0,
        ]);

        if ($request->format === 'pdf') {
            $title = 'Customer Report';
            $period = $this->buildPeriodLabel($request);
            ini_set('memory_limit', '512M');
            $pdf = PDF::loadView('exports.customer_report_pdf', compact('data', 'title', 'period'))
                ->setPaper('A4', 'landscape');
            return $pdf->download('customer_report_' . date('Y-m-d') . '.pdf');
        }

        $filename = 'customer_report_' . date('Y-m-d_His') . '.xls';
        header('Content-type: application/vnd-ms-excel');
        header("Content-Disposition: attachment; filename=$filename");
        return view('exports.google_ads', compact('data'));
    }

    private function buildPeriodLabel(Request $request): string
    {
        if ($request->date_from && $request->date_to) {
            return $request->date_from . ' – ' . $request->date_to;
        }
        if ($request->year && $request->month) {
            return date('F Y', mktime(0, 0, 0, (int) $request->month, 1, (int) $request->year));
        }
        if ($request->year) {
            return $request->year;
        }
        return 'All Time';
    }
}
