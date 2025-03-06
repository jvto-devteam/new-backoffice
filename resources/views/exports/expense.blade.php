<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
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
        <h2 style="margin:0;padding:0;">{{ $title }}</h2>
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
                <td style="vertical-align:top;border:none;padding:2px;width:50%;text-align:right;">
                    @if ($plotting['drivers'] != '')
                        <strong>Driver:</strong> {{ $plotting['drivers'] }}<br>
                    @endif
                    @if ($plotting['escorts'] != '')
                        <strong>Escort:</strong> {{ $plotting['escorts'] }}<br>
                    @endif
                    @if ($plotting['ijens'] != '')
                        <strong>Ijen:</strong> {{ $plotting['ijens'] }}<br>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr style="color:white">
                <th style="background:#304674;width:5%;">No</th>
                <th style="background:#304674;width:27%;">Sub Category</th>
                <th style="background:#304674;width:27%;">Item</th>
                <th style="background:#304674;width:4%;">Qty</th>
                <th style="background:#304674;width:15%;text-align:right">Price</th>
                <th style="background:#304674;width:21%;text-align:right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @php 
                $no = 1;
                $grandTotal = 0;
                $crewExpense = 0;
                $payLater = 0;
            @endphp
            
            <!-- Accommodations -->
            <tr class="section-row">
                <td colspan="6">Accommodation</td>
            </tr>
            @foreach($accommodations as $accommodation)
                
                <!-- Rooms -->
                @foreach($accommodation['rooms'] as $room)
                <tr {{$accommodation['is_debt'] == '1' && $option != 'pay-later' ? "class=row-paid" : ""}}>
                    <td>{{ $no++ }}</td>
                    <td>{{ $accommodation['hotel'] }}</td>
                    <td>{{ $room['room'] }}</td>
                        <td class="text-right">{{ $room['quantity'] }}</td>
                        @if($accommodation['is_debt'] != '1' || $option != 'crew')
                            <td class="text-right">Rp {{ number_format($room['price'], 0, ',', '.') }}</td>
                            <td class="text-right">Rp {{ number_format($room['subtotal'], 0, ',', '.') }}</td>
                            @php $grandTotal += $room['subtotal']; @endphp
                        @else
                            <td class="text-right">-</td>
                            <td class="text-right"><b>PAID</b></td>
                        @endif
                        @if ($accommodation['is_debt'] == '1')
                            @php $payLater += $room['subtotal']; @endphp
                        @else
                            @php $crewExpense += $room['subtotal']; @endphp
                        @endif
                    </tr>
                @endforeach

                <!-- Meals -->
                @if(isset($accommodation['meals']) && count($accommodation['meals']) > 0)
                    @foreach($accommodation['meals'] as $meal)
                        @if($meal['meals'] !== null)
                        <tr {{$accommodation['is_debt'] == '1' && $option != 'pay-later' ? "class=row-paid" : ""}}>
                            <td>{{ $no++ }}</td>
                                <td>{{ $accommodation['hotel'] }}</td>
                                <td>{{ ucfirst($meal['meals']) }}</td>
                                <td class="text-right">{{ $meal['quantity'] }}</td>
                                @if($accommodation['is_debt'] != '1' || $option != 'crew')
                                    <td class="text-right">Rp {{ number_format($meal['price'], 0, ',', '.') }}</td>
                                    <td class="text-right">Rp {{ number_format($meal['subtotal'], 0, ',', '.') }}</td>
                                    @php $grandTotal += $meal['subtotal']; @endphp
                                @else
                                    <td class="text-right">-</td>
                                    <td class="text-right"><b>PAID</b></td>
                                @endif
                                @if ($accommodation['is_debt'] == '1')
                                    @php $payLater += $meal['subtotal']; @endphp
                                @else
                                    @php $crewExpense += $meal['subtotal']; @endphp
                                @endif
    
                            </tr>
                        @endif
                    @endforeach
                @endif
            @endforeach

            <!-- Destinations -->
            <tr class="section-row">
                <td colspan="6">Destination</td>
            </tr>
            @foreach($destinations as $location => $items)
                @foreach($items as $item)
                <tr {{$item['is_debt'] == '1' && $option != 'pay-later' ? "class=row-paid" : ""}}>
                    <td>{{ $no++ }}</td>
                    <td>{{ $location }}</td>
                        <td>{{ $item['item'] }}</td>
                        <td class="text-right">{{ $item['quantity'] }}</td>
                        @if($item['is_debt'] != '1' || $option != 'crew')
                            <td class="text-right">Rp {{ number_format($item['price'], 0, ',', '.') }}</td>
                            <td class="text-right">Rp {{ number_format($item['subtotal'], 0, ',', '.') }}</td>
                            @php $grandTotal += $item['subtotal']; @endphp
                        @else
                            <td class="text-right">-</td>
                            <td class="text-right"><b>PAID</b></td>
                        @endif
                        @if ($item['is_debt'] == '1')
                            @php $payLater += $item['subtotal']; @endphp
                        @else
                            @php $crewExpense += $item['subtotal']; @endphp
                        @endif
                    </tr>
                @endforeach
            @endforeach

            <tr class="section-row">
                <td colspan="6">Others</td>
            </tr>
            @foreach($others as $item)
            <tr {{$item['is_debt'] == '1' && $option != 'pay-later' ? "class=row-paid" : ""}}>
                <td>{{ $no++ }}</td>
                <td>Additional</td>
                <td>{{ $item['item'] }}</td>
                    <td class="text-right">{{ $item['quantity'] }}</td>
                    @if($item['is_debt'] != '1' || $option != 'crew')
                        <td class="text-right">Rp {{ number_format($item['price'], 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($item['subtotal'], 0, ',', '.') }}</td>
                        @php $grandTotal += $item['subtotal']; @endphp
                    @else
                        <td class="text-right">-</td>
                        <td class="text-right"><b>PAID</b></td>
                    @endif
                    @if ($item['is_debt'] == '1')
                        @php $payLater += $item['subtotal']; @endphp
                    @else
                        @php $crewExpense += $item['subtotal']; @endphp
                    @endif

                </tr>
            @endforeach

            <tr class="section-row">
                <td colspan="6">Transport</td>
            </tr>
            @foreach($resources['cars'] as $item)
            <tr {{$item['is_debt'] == '1' && $option != 'pay-later' ? "class=row-paid" : ""}}>
                <td>{{ $no++ }}</td>
                <td>Airport Transportation</td>
                    <td>{{ $item['item'] }}</td>
                    <td class="text-right">{{ $item['quantity'] }}</td>
                    @if($item['is_debt'] != '1' || $option != 'crew')
                        <td class="text-right">Rp {{ number_format($item['price'], 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($item['subtotal'], 0, ',', '.') }}</td>
                        @php $grandTotal += $item['subtotal']; @endphp
                    @else
                        <td class="text-right">-</td>
                        <td class="text-right"><b>PAID</b></td>
                    @endif
                    @if ($item['is_debt'] == '1')
                        @php $payLater += $item['subtotal']; @endphp
                    @else
                        @php $crewExpense += $item['subtotal']; @endphp
                    @endif
                </tr>
            @endforeach


            <!-- Resources -->
            <tr class="section-row">
                <td colspan="6">Resource</td>
            </tr>
            @foreach($resources['crews'] as $item)
            <tr {{$item['is_debt'] == '1' && $option != 'pay-later' ? "class=row-paid" : ""}}>
                <td>{{ $no++ }}</td>
                <td>Crew</td>
                    <td>{{ $item['item'] }}</td>
                    <td class="text-right">{{ $item['quantity'] }}</td>
                    @if($item['is_debt'] != '1' || $option != 'crew')
                        <td class="text-right">Rp {{ number_format($item['price'], 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($item['subtotal'], 0, ',', '.') }}</td>
                        @php $grandTotal += $item['subtotal']; @endphp
                    @else
                        <td class="text-right">-</td>
                        <td class="text-right"><b>PAID</b></td>
                    @endif
                    @if ($item['is_debt'] == '1')
                        @php $payLater += $item['subtotal']; @endphp
                    @else
                        @php $crewExpense += $item['subtotal']; @endphp
                    @endif
                </tr>
            @endforeach

            <!-- Grand Total -->
            <tr class="total-row">
                <td colspan="5" class="text-right"><strong>Total Expense</strong></td>
                <td class="text-right"><strong>Rp {{ number_format($grandTotal, 0, ',', '.') }}</strong></td>
            </tr>
            @if ($option == 'internal')
                <tr>
                    <td colspan="5" class="text-right"><strong>Total Invoice</strong></td>
                    <td style="color:#2563eb" class="text-right"><strong>Rp {{ number_format($booking['total_invoice'], 0, ',', '.') }}</strong></td>
                </tr>
                <tr>
                    <td colspan="5" class="text-right"><strong>Profit</strong></td>
                    <td style="color:#16a34a" class="text-right"><strong>Rp {{ number_format($booking['total_invoice']-$grandTotal, 0, ',', '.') }}</strong></td>
                </tr>
                <tr>
                    <td colspan="5" class="text-right"><strong>Crew Expense</strong></td>
                    <td style="color:#f97316" class="text-right"><strong>Rp {{ number_format($crewExpense, 0, ',', '.') }}</strong></td>
                </tr>
                <tr>
                    <td colspan="5" class="text-right"><strong>Pay Later</strong></td>
                    <td style="color:#f04444" class="text-right"><strong>Rp {{ number_format($payLater, 0, ',', '.') }}</strong></td>
                </tr>
            @endif
        </tbody>
    </table>
</body>
</html>