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
                    @foreach($client as $key =>  $value)
                        @php
                            $bg = "";
                            if($key == 'Payment Status'){
                                if($value == 'Paid'){
                                    $bg = "#00aa00";
                                }
                                else if($value=='DP Paid'){
                                    $bg = "#caca00";
                                }
                                else if($value=='Unpaid'){
                                    $bg = "#ff4a4a";
                                }
                            }
                        @endphp
                        <td {{$key == 'Payment Status' ? "bgcolor=$bg" : ''}}>{{ $value }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>