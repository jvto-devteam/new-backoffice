<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Hutang {{ $vendor->name }} – {{ $period }}</title>
    <style>
        @page { margin: 18px; size: A4 landscape; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10px; line-height: 1.4; }
        h2 { margin: 0 0 2px 0; font-size: 13px; color: #1e3a5f; }
        p.subtitle { margin: 0 0 10px 0; color: #555; font-size: 9px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th { background-color: #3730a3; color: #fff; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; }
        td { padding: 5px 8px; border-bottom: 1px solid #e0e0e0; font-size: 10px; color: #1a1a1a; }
        tr:nth-child(even) td { background-color: #f5f5ff; }
        .text-right { text-align: right; }
        .sub-row td { background-color: #eef0ff; font-size: 9px; color: #444; }
        .footer { margin-top: 12px; font-size: 8px; color: #888; text-align: right; }
    </style>
</head>
<body>
    <h2>Detail Hutang – {{ $vendor->name }}</h2>
    <p class="subtitle">{{ $vendor->vendorCategory->name }} &nbsp;|&nbsp; Periode {{ $period }} &nbsp;|&nbsp; Diexport {{ date('d M Y H:i') }}</p>

    @php
    $totalStyle = 'background-color:#3730a3; color:#ffffff; font-weight:bold; border:none; padding:7px 8px;';
    @endphp

    @if($type === 'hotel')
    <table>
        <thead>
            <tr>
                <th style="width:3%">No</th>
                <th>Tamu</th>
                <th>Check-in</th>
                <th>Tipe Kamar</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Subtotal Kamar</th>
                <th class="text-right">Total Makan</th>
                <th class="text-right">Grand Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($debts as $i => $d)
            {{-- Main booking row --}}
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>
                    <b>{{ $d['customer'] }}</b><br>
                    <span style="font-size:8px;color:#666">{{ $d['travel_date'] }} &middot; {{ $d['pax'] }} pax &middot; {{ $d['channel'] }}</span>
                </td>
                <td>{{ $d['check_in'] }}</td>
                <td colspan="3" style="color:#555;font-style:italic;font-size:9px;">{{ count($d['rooms']) }} tipe kamar</td>
                <td class="text-right">Rp {{ number_format($d['meals_total'], 0, ',', '.') }}</td>
                <td class="text-right"><b>Rp {{ number_format($d['total'], 0, ',', '.') }}</b></td>
            </tr>
            {{-- Sub-rows per room --}}
            @foreach($d['rooms'] as $r)
            <tr class="sub-row">
                <td></td>
                <td colspan="2" style="padding-left:16px;">↳ {{ $r['room'] }}</td>
                <td></td>
                <td class="text-right">{{ $r['quantity'] }}</td>
                <td class="text-right">Rp {{ number_format($r['subtotal'], 0, ',', '.') }}</td>
                <td></td>
                <td></td>
            </tr>
            @endforeach
            @endforeach
            <tr>
                <td colspan="7" style="{{ $totalStyle }} text-align:right;">Total Hutang</td>
                <td style="{{ $totalStyle }} text-align:right;">Rp {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    @elseif($type === 'bromo')
    <table>
        <thead>
            <tr>
                <th style="width:3%">No</th>
                <th>Tamu</th>
                <th>Tgl Aktivitas</th>
                <th class="text-right">Tiket Bromo</th>
                <th class="text-right">Jeep</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($debts as $i => $d)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>
                    {{ $d['customer'] }}<br>
                    <span style="font-size:8px;color:#666">{{ $d['travel_date'] }} &middot; {{ $d['pax'] }} pax &middot; {{ $d['channel'] }}</span>
                </td>
                <td>{{ $d['activity_date'] }}</td>
                <td class="text-right">Rp {{ number_format($d['bromo_ticket'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($d['bromo_jeep'], 0, ',', '.') }}</td>
                <td class="text-right"><b>Rp {{ number_format($d['total'], 0, ',', '.') }}</b></td>
            </tr>
            @endforeach
            <tr>
                <td colspan="5" style="{{ $totalStyle }} text-align:right;">Total Hutang</td>
                <td style="{{ $totalStyle }} text-align:right;">Rp {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    @elseif($type === 'activity')
    <table>
        <thead>
            <tr>
                <th style="width:3%">No</th>
                <th>Tamu</th>
                <th>Tgl Aktivitas</th>
                <th>Aktivitas</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($debts as $i => $d)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>
                    {{ $d['customer'] }}<br>
                    <span style="font-size:8px;color:#666">{{ $d['travel_date'] }} &middot; {{ $d['pax'] }} pax &middot; {{ $d['channel'] }}</span>
                </td>
                <td>{{ $d['activity_date'] }}</td>
                <td>{{ $d['activity'] }}</td>
                <td class="text-right">{{ $d['qty'] }}</td>
                <td class="text-right"><b>Rp {{ number_format($d['total'], 0, ',', '.') }}</b></td>
            </tr>
            @endforeach
            <tr>
                <td colspan="5" style="{{ $totalStyle }} text-align:right;">Total Hutang</td>
                <td style="{{ $totalStyle }} text-align:right;">Rp {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    @elseif($type === 'car')
    <table>
        <thead>
            <tr>
                <th style="width:3%">No</th>
                <th>Tamu</th>
                <th>Kendaraan</th>
                <th>Driver</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($debts as $i => $d)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>
                    {{ $d['customer'] }}<br>
                    <span style="font-size:8px;color:#666">{{ $d['travel_date'] }} &middot; {{ $d['pax'] }} pax &middot; {{ $d['channel'] }}</span>
                </td>
                <td>{{ $d['car'] }}</td>
                <td>{{ $d['driver'] }}</td>
                <td class="text-right">{{ $d['qty'] }}</td>
                <td class="text-right"><b>Rp {{ number_format($d['total'], 0, ',', '.') }}</b></td>
            </tr>
            @endforeach
            <tr>
                <td colspan="5" style="{{ $totalStyle }} text-align:right;">Total Hutang</td>
                <td style="{{ $totalStyle }} text-align:right;">Rp {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    @else {{-- others --}}
    <table>
        <thead>
            <tr>
                <th style="width:3%">No</th>
                <th>Tamu</th>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Harga</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($debts as $i => $d)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>
                    {{ $d['customer'] }}<br>
                    <span style="font-size:8px;color:#666">{{ $d['travel_date'] }} &middot; {{ $d['pax'] }} pax &middot; {{ $d['channel'] }}</span>
                </td>
                <td>{{ $d['item'] }}</td>
                <td class="text-right">{{ $d['qty'] }}</td>
                <td class="text-right">Rp {{ number_format($d['price'], 0, ',', '.') }}</td>
                <td class="text-right"><b>Rp {{ number_format($d['total'], 0, ',', '.') }}</b></td>
            </tr>
            @endforeach
            <tr>
                <td colspan="5" style="{{ $totalStyle }} text-align:right;">Total Hutang</td>
                <td style="{{ $totalStyle }} text-align:right;">Rp {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>
    @endif

    <p class="footer">Java Volcano Tour Operator &mdash; {{ date('d M Y H:i') }}</p>
</body>
</html>
