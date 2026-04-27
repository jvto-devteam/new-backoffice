<b>Detail Hutang – {{ $vendor->name }}</b><br>
<b>Periode: {{ $period }}</b><br>
<br>
@if($type === 'hotel')
<table border="1" width="100%">
    <thead>
        <tr bgcolor="#3730a3" style="color:white;">
            <th>No</th>
            <th>Tamu</th>
            <th>Channel</th>
            <th>Pax</th>
            <th>Travel Date</th>
            <th>Check-in</th>
            <th>Tipe Kamar</th>
            <th>Qty Kamar</th>
            <th>Subtotal Kamar</th>
            <th>Total Makan</th>
            <th>Grand Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($debts as $i => $d)
        {{-- Main booking row (first room merged in) --}}
        @php $firstRoom = $d['rooms'][0] ?? null; @endphp
        <tr>
            <td>{{ $i + 1 }}</td>
            <td><b>{{ $d['customer'] }}</b></td>
            <td>{{ $d['channel'] }}</td>
            <td>{{ $d['pax'] }}</td>
            <td>{{ $d['travel_date'] }}</td>
            <td>{{ $d['check_in'] }}</td>
            <td>{{ $firstRoom ? $firstRoom['room'] : '' }}</td>
            <td>{{ $firstRoom ? $firstRoom['quantity'] : '' }}</td>
            <td>{{ $firstRoom ? $firstRoom['subtotal'] : '' }}</td>
            <td>{{ $d['meals_total'] }}</td>
            <td>{{ $d['total'] }}</td>
        </tr>
        {{-- Sub-rows for remaining rooms --}}
        @foreach($d['rooms'] as $rIdx => $r)
            @if($rIdx > 0)
            <tr bgcolor="#eef0ff">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>{{ $r['room'] }}</td>
                <td>{{ $r['quantity'] }}</td>
                <td>{{ $r['subtotal'] }}</td>
                <td></td>
                <td></td>
            </tr>
            @endif
        @endforeach
        @endforeach
        <tr bgcolor="#e8e8f0">
            <td colspan="10"><b>Total Hutang</b></td>
            <td><b>{{ $total }}</b></td>
        </tr>
    </tbody>
</table>

@elseif($type === 'bromo')
<table border="1" width="100%">
    <thead>
        <tr bgcolor="#3730a3" style="color:white;">
            <th>No</th>
            <th>Tamu</th>
            <th>Channel</th>
            <th>Pax</th>
            <th>Travel Date</th>
            <th>Tgl Aktivitas</th>
            <th>Tiket Bromo</th>
            <th>Jeep Unit</th>
            <th>Bromo Jeep</th>
            <th>Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($debts as $i => $d)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $d['customer'] }}</td>
            <td>{{ $d['channel'] }}</td>
            <td>{{ $d['pax'] }}</td>
            <td>{{ $d['travel_date'] }}</td>
            <td>{{ $d['activity_date'] }}</td>
            <td>{{ $d['bromo_ticket'] }}</td>
            <td>{{ $d['jeep_unit'] }}</td>
            <td>{{ $d['bromo_jeep'] }}</td>
            <td>{{ $d['total'] }}</td>
        </tr>
        @endforeach
        <tr bgcolor="#e8e8f0">
            <td colspan="9"><b>Total Hutang</b></td>
            <td><b>{{ $total }}</b></td>
        </tr>
    </tbody>
</table>

@elseif($type === 'activity')
<table border="1" width="100%">
    <thead>
        <tr bgcolor="#3730a3" style="color:white;">
            <th>No</th>
            <th>Tamu</th>
            <th>Channel</th>
            <th>Pax</th>
            <th>Travel Date</th>
            <th>Tgl Aktivitas</th>
            <th>Aktivitas</th>
            <th>Qty</th>
            <th>Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($debts as $i => $d)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $d['customer'] }}</td>
            <td>{{ $d['channel'] }}</td>
            <td>{{ $d['pax'] }}</td>
            <td>{{ $d['travel_date'] }}</td>
            <td>{{ $d['activity_date'] }}</td>
            <td>{{ $d['activity'] }}</td>
            <td>{{ $d['qty'] }}</td>
            <td>{{ $d['total'] }}</td>
        </tr>
        @endforeach
        <tr bgcolor="#e8e8f0">
            <td colspan="8"><b>Total Hutang</b></td>
            <td><b>{{ $total }}</b></td>
        </tr>
    </tbody>
</table>

@elseif($type === 'car')
<table border="1" width="100%">
    <thead>
        <tr bgcolor="#3730a3" style="color:white;">
            <th>No</th>
            <th>Tamu</th>
            <th>Channel</th>
            <th>Pax</th>
            <th>Travel Date</th>
            <th>Kendaraan</th>
            <th>Driver</th>
            <th>Qty</th>
            <th>Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($debts as $i => $d)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $d['customer'] }}</td>
            <td>{{ $d['channel'] }}</td>
            <td>{{ $d['pax'] }}</td>
            <td>{{ $d['travel_date'] }}</td>
            <td>{{ $d['car'] }}</td>
            <td>{{ $d['driver'] }}</td>
            <td>{{ $d['qty'] }}</td>
            <td>{{ $d['total'] }}</td>
        </tr>
        @endforeach
        <tr bgcolor="#e8e8f0">
            <td colspan="8"><b>Total Hutang</b></td>
            <td><b>{{ $total }}</b></td>
        </tr>
    </tbody>
</table>

@else {{-- others --}}
<table border="1" width="100%">
    <thead>
        <tr bgcolor="#3730a3" style="color:white;">
            <th>No</th>
            <th>Tamu</th>
            <th>Channel</th>
            <th>Pax</th>
            <th>Travel Date</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($debts as $i => $d)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $d['customer'] }}</td>
            <td>{{ $d['channel'] }}</td>
            <td>{{ $d['pax'] }}</td>
            <td>{{ $d['travel_date'] }}</td>
            <td>{{ $d['item'] }}</td>
            <td>{{ $d['qty'] }}</td>
            <td>{{ $d['price'] }}</td>
            <td>{{ $d['total'] }}</td>
        </tr>
        @endforeach
        <tr bgcolor="#e8e8f0">
            <td colspan="8"><b>Total Hutang</b></td>
            <td><b>{{ $total }}</b></td>
        </tr>
    </tbody>
</table>
@endif
