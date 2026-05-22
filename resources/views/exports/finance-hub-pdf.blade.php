<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Finance Hub Report</title>
    <style>
        @page { margin: 20px 24px; }
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10px; color: #1a1a1a; line-height: 1.4; margin: 0; }

        h2   { font-size: 14px; font-weight: bold; color: #1e293b; margin: 0 0 2px; }
        .sub { font-size: 9px; color: #64748b; margin: 0 0 14px; }
        h3   { font-size: 10px; font-weight: bold; color: #334155; margin: 12px 0 5px; text-transform: uppercase; letter-spacing: .4px; }

        /* Summary cards as a compact table */
        .cards { width: 100%; border-collapse: separate; border-spacing: 5px; margin-bottom: 4px; }
        .card { border: 1px solid #e2e8f0; border-radius: 4px; padding: 7px 10px; background: #fff; vertical-align: top; width: 33.3%; }
        .card .lbl { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 3px; }
        .card .val { font-size: 13px; font-weight: bold; color: #1e293b; }
        .card .note { font-size: 8px; color: #94a3b8; margin-top: 2px; }
        .card-green  { border-left: 3px solid #16a34a; }
        .card-red    { border-left: 3px solid #dc2626; }
        .card-blue   { border-left: 3px solid #2563eb; }
        .card-indigo { border-left: 3px solid #4f46e5; }
        .card-orange { border-left: 3px solid #ea580c; }
        .card-yellow { border-left: 3px solid #ca8a04; }

        /* Booking table */
        table.main { width: 100%; border-collapse: collapse; }
        table.main th {
            background: #1e293b; color: #fff;
            padding: 6px 8px; font-size: 8.5px;
            text-transform: uppercase; letter-spacing: .3px;
            text-align: left;
        }
        table.main th.right, table.main td.right { text-align: right; }
        table.main th.center, table.main td.center { text-align: center; }
        table.main td { padding: 5px 8px; font-size: 9.5px; border-bottom: 1px solid #e2e8f0; }
        table.main tr:nth-child(even) td { background: #f8fafc; }
        table.main tfoot td { background: #1e293b; color: #fff; font-weight: bold; padding: 6px 8px; font-size: 9.5px; }

        .ch-twt   { background: #fef9c3; color: #92400e; padding: 1px 5px; border-radius: 8px; font-size: 8px; font-weight: bold; }
        .ch-jvto  { background: #e0e7ff; color: #3730a3; padding: 1px 5px; border-radius: 8px; font-size: 8px; font-weight: bold; }
        .ch-klook { background: #fef3c7; color: #92400e; padding: 1px 5px; border-radius: 8px; font-size: 8px; font-weight: bold; }

        .badge-done    { background: #dcfce7; color: #15803d; padding: 1px 5px; border-radius: 8px; font-size: 8px; }
        .badge-pending { background: #ffedd5; color: #c2410c; padding: 1px 5px; border-radius: 8px; font-size: 8px; }

        .footer { margin-top: 10px; font-size: 8px; color: #94a3b8; text-align: right; }
    </style>
</head>
<body>

@php
    $rp = fn($v) => number_format((int)$v, 0, ',', '.');
    $chLabel = ['TWT'=>'TWT','JVTO'=>'JVTO','KLOOK'=>'KLOOK'];
@endphp

<h2>Finance Hub Report</h2>
<p class="sub">Periode: {{ $dateFrom }} s/d {{ $dateTo }} &mdash; Diekspor pada {{ date('d M Y H:i') }}</p>

{{-- ── Summary Cards ── --}}
<h3>Ringkasan</h3>
<table class="cards">
    <tr>
        <td class="card card-blue">
            <div class="lbl">Total Pendapatan</div>
            <div class="val">Rp {{ $rp($kpi['grand_total']) }}</div>
            <div class="note">{{ count($bookings) }} booking</div>
        </td>
        <td class="card card-red">
            <div class="lbl">Total Expense</div>
            <div class="val">Rp {{ $rp($kpi['total_expense']) }}</div>
        </td>
        <td class="card {{ $kpi['profit'] >= 0 ? 'card-green' : 'card-red' }}">
            <div class="lbl">Total Profit</div>
            <div class="val">Rp {{ $rp($kpi['profit']) }}</div>
        </td>
    </tr>
    <tr>
        <td class="card card-indigo">
            <div class="lbl">Total Crew Expense</div>
            <div class="val">Rp {{ $rp($crew_expense['total']) }}</div>
        </td>
        <td class="card card-green">
            <div class="lbl">Crew Sudah Ditransfer</div>
            <div class="val">Rp {{ $rp($crew_expense['transferred']) }}</div>
        </td>
        <td class="card card-orange">
            <div class="lbl">Crew Belum Ditransfer</div>
            <div class="val">Rp {{ $rp($crew_expense['pending']) }}</div>
        </td>
    </tr>
    <tr>
        <td class="card card-indigo" style="border-left-color:#6366f1">
            <div class="lbl">Balance JVTO Belum Dibayar</div>
            <div class="val">Rp {{ $rp($channel_balance['jvto']) }}</div>
        </td>
        <td class="card card-yellow">
            <div class="lbl">Balance TWT Belum Dibayar</div>
            <div class="val">Rp {{ $rp($channel_balance['twt']) }}</div>
        </td>
        <td></td>
    </tr>
</table>

{{-- ── Booking Table ── --}}
<h3>Daftar Booking ({{ count($bookings) }} trip)</h3>
<table class="main">
    <thead>
        <tr>
            <th>No</th>
            <th>Booking</th>
            <th>Customer</th>
            <th>Ch</th>
            <th>Tanggal</th>
            <th class="right">Grand Total</th>
            <th class="right">Expense</th>
            <th class="right">Crew Expense</th>
            <th class="center">Crew Status</th>
            <th class="right">Profit</th>
        </tr>
    </thead>
    <tbody>
        @foreach($bookings as $i => $b)
        <tr>
            <td class="center" style="color:#94a3b8">{{ $i + 1 }}</td>
            <td>{{ $b['booking_code'] }}</td>
            <td>{{ $b['customer'] }}</td>
            <td>
                @if($b['channel'] === 'TWT')  <span class="ch-twt">TWT</span>
                @elseif($b['channel'] === 'KLOOK') <span class="ch-klook">KLOOK</span>
                @else <span class="ch-jvto">JVTO</span>
                @endif
            </td>
            <td>{{ $b['travel_date_start'] }}</td>
            <td class="right">{{ $rp($b['grand_total']) }}</td>
            <td class="right" style="color:#dc2626">{{ $rp($b['total_expense']) }}</td>
            <td class="right" style="color:#4f46e5">{{ $b['crew_expense'] > 0 ? $rp($b['crew_expense']) : '—' }}</td>
            <td class="center">
                @if($b['crew_expense'] > 0)
                    @if($b['crew_transfer_status'] === 'transferred')
                        <span class="badge-done">Transferred</span>
                    @else
                        <span class="badge-pending">Pending</span>
                    @endif
                @else
                    <span style="color:#cbd5e1">—</span>
                @endif
            </td>
            <td class="right" style="font-weight:bold;color:{{ $b['profit'] >= 0 ? '#16a34a' : '#dc2626' }}">
                {{ $rp($b['profit']) }}
            </td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="5" class="right">TOTAL</td>
            <td class="right">{{ $rp($bookings->sum('grand_total')) }}</td>
            <td class="right">{{ $rp($bookings->sum('total_expense')) }}</td>
            <td class="right">{{ $rp($bookings->sum('crew_expense')) }}</td>
            <td></td>
            <td class="right">{{ $rp($bookings->sum('profit')) }}</td>
        </tr>
    </tfoot>
</table>

<p class="footer">Java Volcano Tour Operator &mdash; {{ date('d M Y H:i') }}</p>
</body>
</html>
