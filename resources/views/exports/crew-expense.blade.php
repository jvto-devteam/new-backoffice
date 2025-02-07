<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Booking System</title>
    <style>
        /* Menggunakan style yang kompatibel dengan dompdf */
        @page {
            margin: 20px;
        }
        body {
            font-family: DejaVu Sans, Arial, sans-serif; /* Font yang kompatibel dengan dompdf */
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
        .section {
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        .section-title {
            background-color: #f0f0f0;
            padding: 8px;
            margin-bottom: 8px;
            font-weight: bold;
            border: 1px solid #000000;
        }
        .total-row {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .summary {
            margin-top: 20px;
            padding: 10px;
            background-color: #f0f0f0;
            border: 1px solid #000000;
        }
        .text-right {
            text-align: right;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .company-info {
            margin-bottom: 20px;
        }
        .booking-info {
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <!-- Header Section -->
    <div class="header">
        <h2 style="margin:0;padding:0;">CREW EXPENSE</h2>
    </div>

    <!-- Company Info -->
    <div class="company-info">
        <table style="width: auto">
            <tr>
                <td style="border:none;padding:2px;">
                    <strong>Customer Name</strong>
                </td>
                <td style="border:none;padding:2px;">
                    <strong>:</strong>
                </td>
                <td style="border:none;padding:2px;">
                    <strong>{{$booking->user->name}} ({{$booking->total_pax}} pax)</strong>
                </td>
            </tr>
            <tr>
                <td style="border:none;padding:2px;">
                    <strong>Duration</strong>
                </td>
                <td style="border:none;padding:2px;">
                    <strong>:</strong>
                </td>
                <td style="border:none;padding:2px;">
                    <strong>{{$booking->package_duration}} Days {{$booking->package_duration == 1 ? 1 : $booking->package_duration-1 }}Nights</strong>
                </td>
            </tr>
            <tr>
                <td style="border:none;padding:2px;">
                    <strong>Trip Date</strong>
                </td>
                <td style="border:none;padding:2px;">
                    <strong>:</strong>
                </td>
                <td style="border:none;padding:2px;">
                    <strong>{{date('d F Y', strtotime($booking->travel_date_start))}}</strong>
                </td>
            </tr>
        </table>
    </div>

    <!-- Accommodations Section -->
    <div class="section">
        <div class="section-title">Accommodations</div>
        
        <!-- Rooms Table -->
        <table>
            <thead>
                <tr>
                    <th style="width:10%;">No</th>
                    <th style="width:40%;">Room Name</th>
                    <th style="width:15%;">Qty</th>
                    <th style="width:15%;">Rate</th>
                    <th style="width:20%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Deluxe Double</td>
                    <td class="text-right">2</td>
                    <td class="text-right">Rp 275.000</td>
                    <td class="text-right">Rp 550.000</td>
                </tr>
                <tr class="total-row">
                    <td colspan="4" class="text-right"><strong>Total</strong></td>
                    <td class="text-right"><strong>Rp 550.000</strong></td>
                </tr>
            </tbody>
        </table>

        <!-- Meals Table -->
        <table>
            <thead>
                <tr>
                    <th style="width:10%;">No</th>
                    <th style="width:40%;">Meal Type</th>
                    <th style="width:15%;">Qty</th>
                    <th style="width:15%;">Rate</th>
                    <th style="width:20%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Dinner</td>
                    <td class="text-right">2</td>
                    <td class="text-right">Rp 150.000</td>
                    <td class="text-right">Rp 300.000</td>
                </tr>
                <tr class="total-row">
                    <td colspan="4" class="text-right"><strong>Total</strong></td>
                    <td class="text-right"><strong>Rp 300.000</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Activities Section -->
    <div class="section">
        <div class="section-title">Activities</div>
        <table>
            <thead>
                <tr>
                    <th style="width:10%;">No</th>
                    <th style="width:40%;">Activity Name</th>
                    <th style="width:15%;">Qty</th>
                    <th style="width:15%;">Price</th>
                    <th style="width:20%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Mount Ijen Tour</td>
                    <td class="text-right">2</td>
                    <td class="text-right">Rp 450.000</td>
                    <td class="text-right">Rp 900.000</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Waterfall Visit</td>
                    <td class="text-right">2</td>
                    <td class="text-right">Rp 250.000</td>
                    <td class="text-right">Rp 500.000</td>
                </tr>
                <tr class="total-row">
                    <td colspan="4" class="text-right"><strong>Total</strong></td>
                    <td class="text-right"><strong>Rp 1.400.000</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Others Section -->
    <div class="section">
        <div class="section-title">Others</div>
        <table>
            <thead>
                <tr>
                    <th style="width:10%;">No</th>
                    <th style="width:40%;">Item</th>
                    <th style="width:15%;">Qty</th>
                    <th style="width:15%;">Price</th>
                    <th style="width:20%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Transport Service</td>
                    <td class="text-right">1</td>
                    <td class="text-right">Rp 200.000</td>
                    <td class="text-right">Rp 200.000</td>
                </tr>
                <tr class="total-row">
                    <td colspan="4" class="text-right"><strong>Total</strong></td>
                    <td class="text-right"><strong>Rp 200.000</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Resource Requirements Section -->
    <div class="section">
        <div class="section-title">Resource Requirements</div>
        <table>
            <thead>
                <tr>
                    <th style="width:10%;">No</th>
                    <th style="width:40%;">Resource Name</th>
                    <th style="width:15%;">Qty</th>
                    <th style="width:15%;">Price</th>
                    <th style="width:20%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Tour Guide</td>
                    <td class="text-right">1</td>
                    <td class="text-right">Rp 350.000</td>
                    <td class="text-right">Rp 350.000</td>
                </tr>
                <tr class="total-row">
                    <td colspan="4" class="text-right"><strong>Total</strong></td>
                    <td class="text-right"><strong>Rp 350.000</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Summary Section -->
    <div class="summary">
        <table style="margin-bottom:0;">
            <tr>
                <td style="border:none;width:80%;text-align:right;"><strong>Total Booking:</strong></td>
                <td style="border:none;width:20%;text-align:right;"><strong>Rp 2.800.000</strong></td>
            </tr>
        </table>
    </div>
</body>
</html>