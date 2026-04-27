<!DOCTYPE html>
<html>
<head><title>Customer Report</title></head>
<body>
    <table border="1" width="100%">
        <thead>
            <tr>
                @foreach($customers->first() as $header => $value)
                    <th style="background-color:#3730a3;color:white;font-weight:bold;">{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($customers as $row)
                <tr>
                    @foreach($row as $key => $value)
                        @php
                            $bg = '';
                            if ($key === 'Payment Status') {
                                $bg = $value === 'Paid' ? '#d1fae5' : ($value === 'DP Paid' ? '#fef3c7' : ($value === 'Unpaid' ? '#fee2e2' : ''));
                            }
                            if ($key === 'Channel') {
                                $bg = $value === 'KLOOK' ? '#d1fae5' : '#dbeafe';
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
