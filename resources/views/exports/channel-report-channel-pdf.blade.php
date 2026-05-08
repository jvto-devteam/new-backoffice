<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $label }} Booking Summary – {{ $period }}</title>
    <style>
        @page { margin: 20px 24px; size: A4 landscape; }
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 10.5px;
            color: #1a1a1a;
            line-height: 1.5;
            margin: 0;
        }
        h2 { font-size: 14px; font-weight: bold; color: #1e293b; margin: 0 0 2px 0; }
        .subtitle { font-size: 9px; color: #64748b; margin: 0 0 14px 0; }

        table { width: 100%; border-collapse: collapse; }
        th {
            background-color: #1e293b;
            color: #fff;
            padding: 7px 9px;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: .4px;
        }
        th.right, td.right { text-align: right; }
        th.center, td.center { text-align: center; }
        td { padding: 5.5px 9px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        tr:nth-child(even) td { background-color: #f8fafc; }

        .row-total td {
            background-color: #1e293b;
            color: #fff;
            font-weight: bold;
            border: none;
            padding: 7px 9px;
        }
        .row-total td.profit { color: #86efac; }
        .row-total td.expense { color: #fca5a5; }
        .footer { margin-top: 14px; font-size: 9px; color: #94a3b8; text-align: right; }
    </style>
</head>
<body>

<h2>{{ $label }} Booking Summary – {{ $period }}</h2>
<p class="subtitle">Exported on {{ date('d M Y H:i') }}</p>

<table>
    <thead>
        <tr>
            <th class="center" style="width:5%">No</th>
            <th style="width:14%">Booking No.</th>
            <th style="width:22%">Customer</th>
            <th class="center" style="width:6%">Pax</th>
            <th style="width:10%">Trip Date</th>
            <th class="right" style="width:16%">Invoice (Rp)</th>
            <th class="right" style="width:16%">Expense (Rp)</th>
            <th class="right" style="width:16%">Profit (Rp)</th>
        </tr>
    </thead>
    <tbody>
        @foreach($bookings as $b)
        <tr>
            <td class="center" style="color:#94a3b8">{{ $b['no'] }}</td>
            <td style="font-family:monospace;font-size:9px;color:#475569">{{ $b['booking_number'] }}</td>
            <td><strong>{{ $b['customer'] }}</strong></td>
            <td class="center">{{ $b['total_pax'] }}</td>
            <td>{{ $b['trip_date'] }}</td>
            <td class="right">{{ number_format($b['invoice'],0,',','.') }}</td>
            <td class="right" style="color:#dc2626">{{ number_format($b['expense'],0,',','.') }}</td>
            <td class="right" style="color:#16a34a;font-weight:bold">{{ number_format($b['profit'],0,',','.') }}</td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr class="row-total">
            <td colspan="5" class="right">TOTAL</td>
            <td class="right">{{ number_format($totals['total_invoice'],0,',','.') }}</td>
            <td class="right expense">{{ number_format($totals['total_expense'],0,',','.') }}</td>
            <td class="right profit">{{ number_format($totals['total_profit'],0,',','.') }}</td>
        </tr>
    </tfoot>
</table>

<p class="footer">Java Volcano Tour Operator &mdash; {{ date('d M Y H:i') }}</p>
</body>
</html>
