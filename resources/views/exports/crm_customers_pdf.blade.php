<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Customer Report</title>
    <style>
        @page { margin: 15px; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 9px; line-height: 1.4; }
        h2 { margin: 0 0 2px 0; font-size: 13px; color: #1e3a5f; }
        p.subtitle { margin: 0 0 10px 0; color: #555; font-size: 9px; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #3730a3; color: #fff; padding: 5px 6px; text-align: left; font-size: 8px; text-transform: uppercase; white-space: nowrap; }
        td { padding: 4px 6px; border-bottom: 1px solid #e5e7eb; font-size: 9px; color: #111; }
        tr:nth-child(even) td { background-color: #f5f5ff; }
        .badge-paid { color: #065f46; font-weight: bold; }
        .badge-dp { color: #92400e; font-weight: bold; }
        .badge-unpaid { color: #991b1b; font-weight: bold; }
        .badge-klook { color: #065f46; }
        .badge-jvto { color: #1e40af; }
        .footer { margin-top: 12px; font-size: 8px; color: #888; text-align: right; }
    </style>
</head>
<body>
    <h2>{{ $title }}</h2>
    <p class="subtitle">Period: {{ $period }} &nbsp;|&nbsp; Exported: {{ date('d M Y H:i') }} &nbsp;|&nbsp; Total: {{ count($customers) }} records</p>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Country</th>
                <th>Channel</th>
                <th>Package</th>
                <th>Booking Date</th>
                <th>Travel Date</th>
                <th>Pax</th>
                <th>Grand Total</th>
                <th>Payment</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Add-ons</th>
                <th>Special Requirements</th>
            </tr>
        </thead>
        <tbody>
            @foreach($customers as $i => $row)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $row['Name'] }}</td>
                    <td>{{ $row['Email'] }}</td>
                    <td>{{ ltrim($row['Phone'], "'") }}</td>
                    <td>{{ $row['Country'] }}</td>
                    <td class="{{ $row['Channel'] === 'KLOOK' ? 'badge-klook' : 'badge-jvto' }}">{{ $row['Channel'] }}</td>
                    <td>{{ $row['Package'] }}</td>
                    <td>{{ $row['Booking Date'] }}</td>
                    <td>{{ $row['Travel Date'] }}</td>
                    <td style="text-align:center">{{ $row['Pax'] }}</td>
                    <td style="text-align:right">{{ number_format($row['Grand Total'], 0, ',', '.') }}</td>
                    <td style="text-align:right">{{ is_numeric($row['Payment']) ? number_format($row['Payment'], 0, ',', '.') : $row['Payment'] }}</td>
                    <td style="text-align:right">{{ is_numeric($row['Balance']) ? number_format($row['Balance'], 0, ',', '.') : $row['Balance'] }}</td>
                    <td class="{{ $row['Payment Status'] === 'Paid' ? 'badge-paid' : ($row['Payment Status'] === 'DP Paid' ? 'badge-dp' : 'badge-unpaid') }}">{{ $row['Payment Status'] }}</td>
                    <td>{{ $row['Add-ons'] }}</td>
                    <td>{{ $row['Special Requirements'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <p class="footer">JVTO Backoffice &mdash; Customer Report &mdash; {{ date('d M Y H:i') }}</p>
</body>
</html>
