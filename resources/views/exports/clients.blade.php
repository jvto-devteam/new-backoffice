<!DOCTYPE html>
<html>
<head>
    <title>Client Data Export</title>
</head>
<body>
    <table border="1" width="100%">
        <thead>
            <tr>
                @foreach($clients->first() as $header => $value)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($clients as $client)
                <tr>
                    @foreach($client as $value)
                        <td>{{ $value }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>