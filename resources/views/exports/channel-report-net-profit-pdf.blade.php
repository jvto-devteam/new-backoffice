<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Finance Report – {{ $period }}</title>
    <style>
        @page { margin: 24px 28px; }
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            line-height: 1.5;
            margin: 0;
        }
        h2 { font-size: 15px; font-weight: bold; color: #1e293b; margin: 0 0 2px 0; }
        .subtitle { font-size: 9px; color: #64748b; margin: 0 0 16px 0; }
        h3 { font-size: 11px; font-weight: bold; color: #334155; margin: 14px 0 6px 0; text-transform: uppercase; letter-spacing: .5px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        th {
            background-color: #1e293b;
            color: #fff;
            padding: 7px 10px;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: .4px;
        }
        th.right, td.right { text-align: right; }
        th.center, td.center { text-align: center; }
        td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 10.5px; }
        tr:nth-child(even) td { background-color: #f8fafc; }

        .row-total td {
            background-color: #f59e0b;
            color: #1a1a1a;
            font-weight: bold;
            border: none;
            padding: 7px 10px;
        }
        .row-expense-total td {
            background-color: #ef4444;
            color: #fff;
            font-weight: bold;
            border: none;
            padding: 7px 10px;
        }
        .profit-box {
            background-color: #16a34a;
            color: #fff;
            padding: 10px 14px;
            border-radius: 6px;
            margin-bottom: 8px;
        }
        .profit-box .label { font-size: 9px; text-transform: uppercase; letter-spacing: .5px; opacity: .8; }
        .profit-box .amount { font-size: 20px; font-weight: bold; }
        .share-box {
            background-color: #334155;
            color: #fff;
            padding: 10px 14px;
            border-radius: 6px;
        }
        .two-col { width: 100%; }
        .two-col td { border: none; padding: 0 6px 0 0; vertical-align: top; background: none; }
        .footer { margin-top: 16px; font-size: 9px; color: #94a3b8; text-align: right; }
        .badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
        }
    </style>
</head>
<body>

<h2>Finance Report – {{ $period }}</h2>
<p class="subtitle">Exported on {{ date('d M Y H:i') }}</p>

{{-- Revenue by Channel --}}
<h3>Revenue by Channel</h3>
<table>
    <thead>
        <tr>
            <th>Channel</th>
            <th class="right">Invoice (Rp)</th>
            <th class="right">Expense (Rp)</th>
            <th class="right">Profit (Rp)</th>
            <th class="center">Bookings</th>
        </tr>
    </thead>
    <tbody>
        @php
            $channelLabels = ['jvto'=>'JVTO','twt'=>'TWT','klook'=>'KLOOK','gyg'=>'GetYourGuide','viator'=>'Viator'];
            $totalRevenue  = 0;
        @endphp
        @foreach($channels as $key => $ch)
            @if(count($ch['bookings']) > 0)
                @php $totalRevenue += $ch['total_profit']; @endphp
                <tr>
                    <td>{{ $channelLabels[$key] ?? strtoupper($key) }}</td>
                    <td class="right">{{ number_format($ch['total_invoice'],0,',','.') }}</td>
                    <td class="right">{{ number_format($ch['total_expense'],0,',','.') }}</td>
                    <td class="right"><strong>{{ number_format($ch['total_profit'],0,',','.') }}</strong></td>
                    <td class="center">{{ count($ch['bookings']) }}</td>
                </tr>
            @endif
        @endforeach
    </tbody>
    <tfoot>
        <tr class="row-total">
            <td>Total Revenue (Profit)</td>
            <td class="right">—</td>
            <td class="right">—</td>
            <td class="right">{{ number_format($totalRevenue,0,',','.') }}</td>
            <td></td>
        </tr>
    </tfoot>
</table>

{{-- Operational Expenses --}}
<h3>Operational Expenses</h3>
@php
    $googleCloud = $googleBill?->google_cloud ?? 0;
    $googleAds   = $googleBill?->google_ads   ?? 0;
    $totalExpense = $googleCloud + $googleAds;
    $netProfit    = $totalRevenue - $totalExpense;
    $share5pct    = round($netProfit * 0.05);
@endphp
<table>
    <thead>
        <tr>
            <th>Description</th>
            <th class="right">Amount (Rp)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Google Cloud Bill</td>
            <td class="right">{{ number_format($googleCloud,0,',','.') }}</td>
        </tr>
        <tr>
            <td>Google Ads</td>
            <td class="right">{{ number_format($googleAds,0,',','.') }}</td>
        </tr>
    </tbody>
    <tfoot>
        <tr class="row-expense-total">
            <td>Total Expense</td>
            <td class="right">{{ number_format($totalExpense,0,',','.') }}</td>
        </tr>
    </tfoot>
</table>

{{-- Net Profit --}}
<table class="two-col">
    <tr>
        <td style="width:50%">
            <div class="profit-box">
                <div class="label">NET PROFIT</div>
                <div class="amount">Rp {{ number_format($netProfit,0,',','.') }}</div>
                <div style="font-size:9px;opacity:.7;margin-top:2px">
                    {{ number_format($totalRevenue,0,',','.') }} &minus; {{ number_format($totalExpense,0,',','.') }}
                </div>
            </div>
        </td>
        <td style="width:50%;padding-left:8px">
            <div class="share-box">
                <div class="label">5% Share of Net Profit</div>
                <div class="amount">Rp {{ number_format($share5pct,0,',','.') }}</div>
                <div style="font-size:9px;opacity:.7;margin-top:2px">
                    5% &times; {{ number_format($netProfit,0,',','.') }}
                </div>
            </div>
        </td>
    </tr>
</table>

<p class="footer">Java Volcano Tour Operator &mdash; {{ date('d M Y H:i') }}</p>
</body>
</html>
