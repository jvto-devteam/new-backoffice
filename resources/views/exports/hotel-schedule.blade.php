<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Schedule Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
        }
        .header {
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 18px;
            color: #333;
            margin: 0 0 5px 0;
        }
        .header p {
            margin: 0;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 20px;
            font-size: 10px;
            color: #666;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Schedule Report</h1>
        <p>{{ $hotel->name }}</p>
        <p>Period: {{ $start }} to {{ $end }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Customer</th>
                <th>Check In</th>
                <th>Rooms</th>
                <th>Participants</th>
                <th>Meals</th>
                <th style="text-align: right">Total</th>
            </tr>
        </thead>
        <tbody>
            @php
                $grandTotal = 0;
            @endphp
            
            @foreach($schedule as $booking)
                @php
                    $totalMeals = collect($booking['meals'])->sum('subtotal');
                    $totalRooms = collect($booking['rooms'])->sum('subtotal');
                    $total = $totalMeals + $totalRooms;
                    $grandTotal += $total;
                @endphp
                <tr>
                    <td>{{ $booking['customer'] }}</td>
                    <td>{{ $booking['check_in'] }}</td>
                    <td>
                        @foreach($booking['rooms'] as $room)
                            {{ $room['quantity'] }}x {{ $room['room_name'] }}@if(!$loop->last), @endif
                        @endforeach
                    </td>
                    <td>{{ $booking['participants'] }}</td>
                    <td>
                        @if(count($booking['meals']) > 0)
                            @foreach($booking['meals'] as $meal)
                                {{ $meal['quantity'] }}x {{ ucfirst($meal['meals']) }}@if(!$loop->last), @endif
                            @endforeach
                        @else
                            -
                        @endif
                    </td>
                    <td style="text-align: right">Rp {{ number_format($total, 0, ',', '.') }}</td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="5" style="text-align: right">Grand Total:</td>
                <td style="text-align: right">Rp {{ number_format($grandTotal, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Generated on: {{ now()->format('d F Y H:i:s') }}
    </div>
</body>
</html>