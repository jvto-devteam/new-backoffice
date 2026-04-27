<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Package Performance</title>
    <style>
        @page { margin: 20px; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; line-height: 1.4; }
        h2 { margin: 0 0 4px 0; font-size: 14px; color: #1e3a5f; }
        p.subtitle { margin: 0 0 12px 0; color: #555; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #3730a3; color: #fff; padding: 7px 10px; text-align: left; font-size: 10px; text-transform: uppercase; }
        td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
        tr:nth-child(even) td { background-color: #f5f5ff; }
        .text-right { text-align: right; }
        .footer { margin-top: 16px; font-size: 9px; color: #888; text-align: right; }
    </style>
</head>
<body>
    <h2>Package Performance</h2>
    <p class="subtitle">Period: {{ $period }} &nbsp;|&nbsp; Exported: {{ date('d M Y H:i') }} &nbsp;|&nbsp; {{ count($packages) }} packages</p>
    <table>
        <thead>
            <tr>
                <th style="width:4%">#</th>
                <th>Package</th>
                <th>Code</th>
                <th class="text-right">Bookings</th>
                <th class="text-right">Total Pax</th>
                <th class="text-right">Revenue (IDR)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($packages as $i => $row)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $row['Package'] }}</td>
                    <td>{{ $row['Code'] }}</td>
                    <td class="text-right">{{ $row['Bookings'] }}</td>
                    <td class="text-right">{{ $row['Total Pax'] }}</td>
                    <td class="text-right">{{ number_format($row['Revenue (IDR)'], 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <p class="footer">JVTO Backoffice &mdash; Package Performance &mdash; {{ date('d M Y H:i') }}</p>
</body>
</html>
