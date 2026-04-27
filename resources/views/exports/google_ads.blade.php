<!DOCTYPE html>
<html>
<head>
    <title>Google Ads Audience Export</title>
</head>
<body>
    <table border="1" width="100%">
        <thead>
            <tr style="background-color:#4285F4;color:white;font-weight:bold;">
                @foreach($data->first() as $header => $value)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
                <tr>
                    @foreach($row as $key => $value)
                        @php
                            $bg = "";
                            if ($key == 'Channel') {
                                $bg = $value == 'KLOOK' ? '#e8f5e9' : '#e3f2fd';
                            }
                        @endphp
                        <td @if($bg) bgcolor="{{ $bg }}" @endif>{{ $value }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
