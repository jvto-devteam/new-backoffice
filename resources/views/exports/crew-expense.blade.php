<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CREW EXPENSE</title>
    <style>
        @page {
            margin: 20px;
        }
        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            line-height: 1.5;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            page-break-inside: auto;
        }
        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }
        th, td {
            border: 1px solid #000000;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .section-row {
            background-color: #e1e8f0;
            color:#304674;
            font-weight: bold;
        }
        .subsection-row {
            background-color: #fafafa;
            font-style: italic;
        }
        .total-row {
            background-color: #304674;
            color:white;
            font-weight: bold;
        }
        .text-right {
            text-align: right;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .booking-info {
            margin-bottom: 20px;
        }
        .mt-10 {
            margin-top: 10px;
        }
        .row-paid,.row-paid td{
            background: #fef2f2;
            color:#f87575;
        }
    </style>
</head>
<body>
    <!-- Header Section -->
    <div class="header">
        <h2 style="margin:0;padding:0;">CREW EXPENSE</h2>
    </div>

    <!-- Booking Info -->
    <div class="booking-info">
        <table>
            <tr>
                <td style="border:none;padding:2px;width:50%;">
                    <strong>Customer Name:</strong> {{ $booking['customer_name'] }} ({{ $booking['total_pax'] }} PAX)<br>
                    <strong>Duration:</strong> {{ $booking['duration'] }}
                    <br>
                    <strong>Travel Date:</strong> {{ $booking['travel_date_start'] }}
                </td>
                <td style="border:none;padding:2px;width:50%;text-align:right;">
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr style="color:white">
                <th style="background:#304674;width:10%;">No</th>
                <th style="background:#304674;width:40%;">Item</th>
                <th style="background:#304674;width:15%;">Qty</th>
                <th style="background:#304674;width:15%;">Price</th>
                <th style="background:#304674;width:20%;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @php 
                $no = 1;
                $grandTotal = 0;
            @endphp
            
            <!-- Accommodations -->
            @foreach($accommodations as $accommodation)
                <tr class="section-row">
                    <td colspan="5">{{ $accommodation['hotel'] }}</td>
                </tr>
                
                <!-- Rooms -->
                @foreach($accommodation['rooms'] as $room)
                    <tr {{$accommodation['is_debt'] == '1' ? "class=row-paid" : ""}}>
                        <td>{{ $no++ }}</td>
                        <td>{{ $room['room'] }}</td>
                        <td class="text-right">{{ $room['quantity'] }}</td>
                        @if($accommodation['is_debt'] != '1')
                            <td class="text-right">Rp {{ number_format($room['price'], 0, ',', '.') }}</td>
                            <td class="text-right">Rp {{ number_format($room['subtotal'], 0, ',', '.') }}</td>
                            @php $grandTotal += $room['subtotal']; @endphp
                        @else
                            <td class="text-right">-</td>
                            <td class="text-right"><b>PAID</b></td>
                        @endif
                    </tr>
                @endforeach

                <!-- Meals -->
                @if(isset($accommodation['meals']) && count($accommodation['meals']) > 0)
                    @foreach($accommodation['meals'] as $meal)
                        @if($meal['meals'] !== null)
                        <tr {{$accommodation['is_debt'] == '1' ? "class=row-paid" : ""}}>
                            <td>{{ $no++ }}</td>
                                <td>{{ ucfirst($meal['meals']) }}</td>
                                <td class="text-right">{{ $meal['quantity'] }}</td>
                                @if($accommodation['is_debt'] != '1')
                                    <td class="text-right">Rp {{ number_format($meal['price'], 0, ',', '.') }}</td>
                                    <td class="text-right">Rp {{ number_format($meal['subtotal'], 0, ',', '.') }}</td>
                                    @php $grandTotal += $meal['subtotal']; @endphp
                                @else
                                    <td class="text-right">-</td>
                                    <td class="text-right"><b>PAID</b></td>
                                @endif
                            </tr>
                        @endif
                    @endforeach
                @endif
            @endforeach

            <!-- Destinations -->
            @foreach($destinations as $location => $items)
                <tr class="section-row">
                    <td colspan="5">{{ $location }}</td>
                </tr>
                @foreach($items as $item)
                <tr {{$item['is_debt'] == '1' ? "class=row-paid" : ""}}>
                    <td>{{ $no++ }}</td>
                        <td>{{ $item['item'] }}</td>
                        <td class="text-right">{{ $item['quantity'] }}</td>
                        @if($item['is_debt'] != '1')
                            <td class="text-right">Rp {{ number_format($item['price'], 0, ',', '.') }}</td>
                            <td class="text-right">Rp {{ number_format($item['subtotal'], 0, ',', '.') }}</td>
                            @php $grandTotal += $item['subtotal']; @endphp
                        @else
                            <td class="text-right">-</td>
                            <td class="text-right"><b>PAID</b></td>
                        @endif
                    </tr>
                @endforeach
            @endforeach

            <!-- Resources -->
            <tr class="section-row">
                <td colspan="5">Resource Requirements</td>
            </tr>
            @foreach($resources['crews'] as $item)
            <tr {{$item['is_debt'] == '1' ? "class=row-paid" : ""}}>
                <td>{{ $no++ }}</td>
                    <td>{{ $item['item'] }}</td>
                    <td class="text-right">{{ $item['quantity'] }}</td>
                    @if($item['is_debt'] != '1')
                        <td class="text-right">Rp {{ number_format($item['price'], 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($item['subtotal'], 0, ',', '.') }}</td>
                        @php $grandTotal += $item['subtotal']; @endphp
                    @else
                        <td class="text-right">-</td>
                        <td class="text-right"><b>PAID</b></td>
                    @endif
                </tr>
            @endforeach
            @foreach($resources['cars'] as $item)
            <tr {{$item['is_debt'] == '1' ? "class=row-paid" : ""}}>
                <td>{{ $no++ }}</td>
                    <td>{{ $item['item'] }}</td>
                    <td class="text-right">{{ $item['quantity'] }}</td>
                    @if($item['is_debt'] != '1')
                        <td class="text-right">Rp {{ number_format($item['price'], 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($item['subtotal'], 0, ',', '.') }}</td>
                        @php $grandTotal += $item['subtotal']; @endphp
                    @else
                        <td class="text-right">-</td>
                        <td class="text-right"><b>PAID</b></td>
                    @endif
                </tr>
            @endforeach

            <!-- Others -->
            <tr class="section-row">
                <td colspan="5">Others</td>
            </tr>
            @foreach($others as $item)
            <tr {{$item['is_debt'] == '1' ? "class=row-paid" : ""}}>
                <td>{{ $no++ }}</td>
                    <td>{{ $item['item'] }}</td>
                    <td class="text-right">{{ $item['quantity'] }}</td>
                    @if($item['is_debt'] != '1')
                        <td class="text-right">Rp {{ number_format($item['price'], 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($item['subtotal'], 0, ',', '.') }}</td>
                        @php $grandTotal += $item['subtotal']; @endphp
                    @else
                        <td class="text-right">-</td>
                        <td class="text-right"><b>PAID</b></td>
                    @endif
                </tr>
            @endforeach

            <!-- Grand Total -->
            <tr class="total-row">
                <td colspan="4" class="text-right"><strong>Grand Total</strong></td>
                <td class="text-right"><strong>Rp {{ number_format($grandTotal, 0, ',', '.') }}</strong></td>
            </tr>
        </tbody>
    </table>
</body>
</html>