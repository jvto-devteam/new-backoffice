<b>Rekap Hutang – {{ $period }}</b><br>
<br>
<table border="1" width="100%">
    <thead>
        <tr bgcolor="#3730a3" style="color: white;">
            <th>No</th>
            <th>Vendor</th>
            <th>Kategori</th>
            <th>Jumlah Item</th>
            <th>Total Hutang</th>
        </tr>
    </thead>
    <tbody>
        @foreach($vendors as $i => $v)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $v['name'] }}</td>
            <td>{{ $v['category'] }}</td>
            <td>{{ $v['item_count'] }}</td>
            <td>{{ $v['total'] }}</td>
        </tr>
        @endforeach
        <tr bgcolor="#e8e8f0">
            <td colspan="4"><b>Total Hutang</b></td>
            <td><b>{{ $total }}</b></td>
        </tr>
    </tbody>
</table>
