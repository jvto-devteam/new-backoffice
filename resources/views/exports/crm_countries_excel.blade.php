<!DOCTYPE html>
<html>
<head><title>Customer by Country</title></head>
<body>
    <table border="0" width="100%">
        <tr><td colspan="4" style="font-size:14px;font-weight:bold;">Customer by Country – {{ $period }}</td></tr>
        <tr><td colspan="4" style="font-size:10px;color:#555;">Exported: {{ date('d M Y H:i') }}</td></tr>
        <tr><td></td></tr>
    </table>
    <table border="1" width="100%">
        <thead>
            <tr>
                <th style="background-color:#3730a3;color:white;">#</th>
                @foreach($countries->first() as $header => $value)
                    <th style="background-color:#3730a3;color:white;font-weight:bold;">{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($countries as $i => $row)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    @foreach($row as $value)
                        <td>{{ $value }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
