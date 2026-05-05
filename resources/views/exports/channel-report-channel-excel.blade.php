<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; }
        h2 { font-size: 14pt; color: #1e293b; margin-bottom: 2px; }
        .subtitle { font-size: 9pt; color: #64748b; margin-bottom: 14px; }
        table { border-collapse: collapse; width: 100%; }
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
        .row-total td {
            background-color: #1e293b;
            color: #fff;
            font-weight: bold;
            border: 1px solid #0f172a;
        }
        .row-total td.profit { color: #86efac; }
        .row-total td.expense { color: #fca5a5; }
        .footer { font-size: 8pt; color: #94a3b8; text-align: right; margin-top: 14px; }
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
            <td style="font-family:monospace;font-size:9pt;color:#475569">{{ $b['booking_number'] }}</td>
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

<p class="footer">Java Volcano Tour Operator — {{ date('d M Y H:i') }}</p>
</body>
</html>
