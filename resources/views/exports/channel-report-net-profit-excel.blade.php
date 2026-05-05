<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; }
        h2 { font-size: 14pt; color: #1e293b; margin-bottom: 2px; }
        .subtitle { font-size: 9pt; color: #64748b; margin-bottom: 14px; }
        h3 { font-size: 11pt; color: #334155; margin: 12px 0 4px 0; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 14px; }
        th {
            background-color: #1e293b;
            color: #fff;
            padding: 6px 10px;
            font-size: 9pt;
            text-align: left;
            border: 1px solid #1e293b;
        }
        th.right, td.right { text-align: right; }
        th.center, td.center { text-align: center; }
        td { padding: 5px 10px; border: 1px solid #cbd5e1; font-size: 10.5pt; }
        tr:nth-child(even) td { background-color: #f8fafc; }
        .row-total td { background-color: #f59e0b; color: #1a1a1a; font-weight: bold; border: 1px solid #d97706; }
        .row-expense-total td { background-color: #ef4444; color: #fff; font-weight: bold; border: 1px solid #dc2626; }
        .row-net-profit td { background-color: #16a34a; color: #fff; font-weight: bold; font-size: 12pt; border: 1px solid #15803d; }
        .row-share td { background-color: #334155; color: #fff; font-weight: bold; border: 1px solid #1e293b; }
        .footer { font-size: 8pt; color: #94a3b8; text-align: right; margin-top: 14px; }
    </style>
</head>
<body>

<h2>Finance Report – {{ $period }}</h2>
<p class="subtitle">Exported on {{ date('d M Y H:i') }}</p>

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

<h3>Operational Expenses</h3>
@php
    $googleCloud  = $googleBill?->google_cloud ?? 0;
    $googleAds    = $googleBill?->google_ads   ?? 0;
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

<table style="width:60%">
    <tr class="row-net-profit">
        <td>NET PROFIT</td>
        <td class="right">Rp {{ number_format($netProfit,0,',','.') }}</td>
    </tr>
    <tr class="row-share">
        <td>5% Share of Net Profit</td>
        <td class="right">Rp {{ number_format($share5pct,0,',','.') }}</td>
    </tr>
</table>

<p class="footer">Java Volcano Tour Operator — {{ date('d M Y H:i') }}</p>
</body>
</html>
