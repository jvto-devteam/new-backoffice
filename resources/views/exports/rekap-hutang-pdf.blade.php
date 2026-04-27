<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Hutang {{ $period }}</title>
    <style>
        @page { margin: 20px; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; line-height: 1.4; }
        h2 { margin: 0 0 4px 0; font-size: 14px; color: #1e3a5f; }
        p.subtitle { margin: 0 0 12px 0; color: #555; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th { background-color: #3730a3; color: #ffffff; padding: 7px 10px; text-align: left; font-size: 10px; text-transform: uppercase; }
        td { padding: 6px 10px; border-bottom: 1px solid #e0e0e0; font-size: 11px; color: #1a1a1a; }
        tr:nth-child(even) td { background-color: #f5f5ff; }
        .text-right { text-align: right; }
        .footer { margin-top: 16px; font-size: 9px; color: #888; text-align: right; }
    </style>
</head>
<body>
    <h2>Rekap Hutang – {{ $period }}</h2>
    <p class="subtitle">Diexport pada {{ date('d M Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th style="width:4%">No</th>
                <th>Vendor</th>
                <th>Kategori</th>
                <th style="width:8%" class="text-right">Item</th>
                <th style="width:22%" class="text-right">Total Hutang</th>
            </tr>
        </thead>
        <tbody>
            @foreach($vendors as $i => $v)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $v['name'] }}</td>
                <td>{{ $v['category'] }}</td>
                <td class="text-right">{{ $v['item_count'] }}</td>
                <td class="text-right">{{ $v['formatted_total'] }}</td>
            </tr>
            @endforeach
            <tr>
                <td colspan="4" class="text-right" style="background-color:#3730a3; color:#ffffff; font-weight:bold; border:none; padding:7px 10px;">Total Hutang</td>
                <td class="text-right" style="background-color:#3730a3; color:#ffffff; font-weight:bold; border:none; padding:7px 10px;">Rp {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <p class="footer">Java Volcano Tour Operator &mdash; {{ date('d M Y H:i') }}</p>
</body>
</html>
