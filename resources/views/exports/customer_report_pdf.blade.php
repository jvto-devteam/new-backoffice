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
        th { background-color: #4285F4; color: #fff; padding: 5px 6px; text-align: left; font-size: 8px; text-transform: uppercase; white-space: nowrap; }
        td { padding: 4px 6px; border-bottom: 1px solid #e5e7eb; font-size: 9px; color: #111; }
        tr:nth-child(even) td { background-color: #f5f5ff; }
        .badge-klook { color: #065f46; }
        .badge-jvto { color: #1e40af; }
        .footer { margin-top: 12px; font-size: 8px; color: #888; text-align: right; }
    </style>
</head>
<body>
    <h2>{{ $title }}</h2>
    <p class="subtitle">Period: {{ $period }} &nbsp;|&nbsp; Exported: {{ date('d M Y H:i') }} &nbsp;|&nbsp; Total: {{ count($data) }} records</p>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Email</th>
                <th>Phone</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Country</th>
                <th>Booking Date</th>
                <th>Travel Date</th>
                <th>Package</th>
                <th>Channel</th>
                <th>Pax</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $i => $row)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $row['Email'] }}</td>
                    <td>{{ ltrim($row['Phone'], "'") }}</td>
                    <td>{{ $row['First Name'] }}</td>
                    <td>{{ $row['Last Name'] }}</td>
                    <td>{{ $row['Country'] }}</td>
                    <td>{{ $row['Booking Date'] }}</td>
                    <td>{{ $row['Travel Date'] }}</td>
                    <td>{{ $row['Package'] }}</td>
                    <td class="{{ $row['Channel'] === 'KLOOK' ? 'badge-klook' : 'badge-jvto' }}">{{ $row['Channel'] }}</td>
                    <td style="text-align:center">{{ $row['Pax'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <p class="footer">JVTO Backoffice &mdash; Customer Report &mdash; {{ date('d M Y H:i') }}</p>
</body>
</html>
