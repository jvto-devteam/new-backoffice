<html>
<head><meta charset="UTF-8"></head>
<body>
@php
    $rp = fn($v) => number_format((int)$v, 0, ',', '.');
@endphp

<table>
    <tr><td colspan="2"><strong>Finance Hub Report</strong></td></tr>
    <tr><td>Periode</td><td>{{ $dateFrom }} s/d {{ $dateTo }}</td></tr>
    <tr><td>Diekspor</td><td>{{ date('d M Y H:i') }}</td></tr>
</table>

<br>

{{-- Summary --}}
<table border="1" cellpadding="5" cellspacing="0">
    <tr bgcolor="#1e293b"><th colspan="2" style="color:white">RINGKASAN</th></tr>
    <tr><td>Total Pendapatan</td><td>{{ $rp($kpi['grand_total']) }}</td></tr>
    <tr><td>Total Expense</td><td>{{ $rp($kpi['total_expense']) }}</td></tr>
    <tr><td>Total Profit</td><td>{{ $rp($kpi['profit']) }}</td></tr>
    <tr><td>Total Crew Expense</td><td>{{ $rp($crew_expense['total']) }}</td></tr>
    <tr><td>Crew Sudah Ditransfer</td><td>{{ $rp($crew_expense['transferred']) }}</td></tr>
    <tr><td>Crew Belum Ditransfer</td><td>{{ $rp($crew_expense['pending']) }}</td></tr>
    <tr><td>Balance JVTO Belum Dibayar</td><td>{{ $rp($channel_balance['jvto']) }}</td></tr>
    <tr><td>Balance TWT Belum Dibayar</td><td>{{ $rp($channel_balance['twt']) }}</td></tr>
</table>

<br>

{{-- Bookings --}}
<table border="1" cellpadding="5" cellspacing="0">
    <tr bgcolor="#1e293b">
        <th style="color:white">No</th>
        <th style="color:white">Booking</th>
        <th style="color:white">Customer</th>
        <th style="color:white">Channel</th>
        <th style="color:white">Tanggal</th>
        <th style="color:white">Grand Total</th>
        <th style="color:white">Expense</th>
        <th style="color:white">Crew Expense</th>
        <th style="color:white">Crew Status</th>
        <th style="color:white">Profit</th>
    </tr>
    @foreach($bookings as $i => $b)
    <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $b['booking_code'] }}</td>
        <td>{{ $b['customer'] }}</td>
        <td>{{ $b['channel'] }}</td>
        <td>{{ $b['travel_date_start'] }}</td>
        <td align="right">{{ $rp($b['grand_total']) }}</td>
        <td align="right">{{ $rp($b['total_expense']) }}</td>
        <td align="right">{{ $b['crew_expense'] > 0 ? $rp($b['crew_expense']) : '-' }}</td>
        <td>{{ $b['crew_expense'] > 0 ? ($b['crew_transfer_status'] === 'transferred' ? 'Transferred' : 'Pending') : '-' }}</td>
        <td align="right">{{ $rp($b['profit']) }}</td>
    </tr>
    @endforeach
    <tr bgcolor="#f1f5f9">
        <td colspan="5" align="right"><strong>TOTAL</strong></td>
        <td align="right"><strong>{{ $rp($bookings->sum('grand_total')) }}</strong></td>
        <td align="right"><strong>{{ $rp($bookings->sum('total_expense')) }}</strong></td>
        <td align="right"><strong>{{ $rp($bookings->sum('crew_expense')) }}</strong></td>
        <td></td>
        <td align="right"><strong>{{ $rp($bookings->sum('profit')) }}</strong></td>
    </tr>
</table>
</body>
</html>
