@php
    $name = "_".$filters['startDate']."_".$filters['endDate']."_";
    $name .= request()->channel ? request()->channel : 'all';
@endphp
<b>Period : {{date('d',strtotime($filters['startDate']))}} - {{date('d M Y',strtotime($filters['endDate']))}}</b>
<br>
<table width="100%" border="1">
    <thead>
        <tr bgcolor="#3c4099" style="color: white; text-align: center">
            <th>#</th>
            <th>ID</th>
            <th>Customer Name</th>
            <th>Country</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Package</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>No. of Participants</th>
            <th>Order Channel</th>
            <th>T-Shirt</th>
            <th>Pickup Location</th>
            <th>End Tour Details</th>
            <th>Shuttle</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Guide</th>
            <th>Note</th>
            <th>Day 1</th>
            <th>Day 1 Date</th>
            <th>Day 1 Hotel</th>
            <th>Day 1 Room Type</th>

            <th>Day 2</th>
            <th>Day 2 Date</th>
            <th>Day 2 Hotel</th>
            <th>Day 2 Room Type</th>

            <th>Day 3</th>
            <th>Day 3 Date</th>
            <th>Day 3 Hotel</th>
            <th>Day 3 Room Type</th>

            <th>Day 4</th>
            <th>Day 4 Date</th>
            <th>Day 4 Hotel</th>
            <th>Day 4 Room Type</th>

            <th>Day 5</th>
            <th>Day 5 Date</th>
            <th>Day 5 Hotel</th>
            <th>Day 5 Room Type</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($bookingReal as $item)
            <tr>
                <td>{{$loop->iteration}}</td>
                <td>
                    @if ($item->agent_id == 1)
                        TWT-{{$item->id}}
                        @php
                            $order_channel = "TWT";    
                        @endphp
                    @elseif ($item->agent_id == 2)
                        @if ($item->booking_category_id == 3)
                            KLK-{{$item->id}}
                            @php
                                $order_channel = "KLK";    
                            @endphp
                        @else
                            JVTO-{{$item->id}}
                            @php
                                $order_channel = "JVTO";    
                            @endphp
                        @endif
                    @endif
                </td>
                <td>
                    {{$item->user->name}}
                </td>
                <td>{{$item->user->country ? $item->user->country->long_name : ''}}</td>
                <td>{{$item->user->phone}}</td>
                <td>{{$item->user->email}}</td>
                <td>{{$item->bookingDetail[0]->package ? $item->bookingDetail[0]->package->name : ''}}</td>
                <td>
                    {{$item->travel_date_start}}
                </td>
                <td>
                    {{$item->travel_date_end}}
                </td>
                <td>
                    {{$item->total_pax}}
                </td>
                <td>
                    {{$order_channel}}
                </td>
                <td>
                    @if ($item->bookingDetail[0]->xss && $item->bookingDetail[0]->xxs && $item->bookingDetail[0]->xs && $item->bookingDetail[0]->s && $item->bookingDetail[0]->m && $item->bookingDetail[0]->l && $item->bookingDetail[0]->xl && $item->bookingDetail[0]->xxl && $item->bookingDetail[0]->xxxl)
                        -
                    @else
                        {{$item->bookingDetail[0]->xss ? 'XSS-'.$item->bookingDetail[0]->xss.'; ' : ''}}
                        {{$item->bookingDetail[0]->xxs ? 'XXS-'.$item->bookingDetail[0]->xxs.'; ' : ''}}
                        {{$item->bookingDetail[0]->xs ? 'XS-'.$item->bookingDetail[0]->xs.'; ' : ''}}
                        {{$item->bookingDetail[0]->s ? 'S-'.$item->bookingDetail[0]->s.'; ' : ''}}
                        {{$item->bookingDetail[0]->m ? 'M-'.$item->bookingDetail[0]->m.'; ' : ''}}
                        {{$item->bookingDetail[0]->l ? 'L-'.$item->bookingDetail[0]->l.'; ' : ''}}
                        {{$item->bookingDetail[0]->xl ? 'XL-'.$item->bookingDetail[0]->xl.'; ' : ''}}
                        {{$item->bookingDetail[0]->xxl ? 'XXL-'.$item->bookingDetail[0]->xxl.'; ' : ''}}
                        {{$item->bookingDetail[0]->xxxl ? 'XXXL-'.$item->bookingDetail[0]->xxxl.'; ' : ''}}
                    @endif
                </td>
                <td>
                    {{$item->pickup}} {{$item->ticket_type_number ? "(".$item->ticket_type_number.")" : ""}} &nbsp; {{$item->pickup_time ? date("H:i",strtotime($item->pickup_time)) : ""}}                    
                </td>
                <td>
                    {{$item->drop}} &nbsp; {{$item->drop_time ? date("H:i",strtotime($item->drop_time)) : ""}}                    
                </td>
                <td>{{$item->is_shuttle == '1' ? 'Yes' : 'No'}}</td>
                <td>
                    @foreach ($item->bookCar as $keyCar => $car)
                        @php
                            $isComa = count($item->bookCar) != ($keyCar + 1) ? ', ' : '';
                        @endphp
                        {{ $car->car->name }}<?= $isComa ?>
                    @endforeach
                </td>
                <td>
                    @foreach ($item->guideDriver as $keyDriver => $driver)
                        @if ($driver->person->is_driver == '1')
                            @php
                                $isComa = count($item->guideDriver) != ($keyDriver + 1) ? ', ' : '';
                            @endphp
                            {{ $driver->person->name }}<?= $isComa ?>
                        @endif
                    @endforeach
                </td>
                <td>
                    @foreach ($item->guideDriver as $keyGuide => $guide)
                        @if ($guide->person->is_driver == '0')
                            @php
                                $isComa = count($item->guideDriver) != ($keyGuide + 1) ? ', ' : '';
                            @endphp
                            {{ $guide->person->name }}<?= $isComa ?>
                        @endif
                    @endforeach
                </td>
                <td>{{$item->note}}</td>
                @foreach ($item->bookingItinerary as $iti)
                    <td>{{$iti->itinerary}}</td>
                    @php
                        $night = $iti->day - 1
                    @endphp
                    <td>{{date("Y-m-d",strtotime($item->travel_date_start." + $night days"))}}</td>
                    <td>
                        {{$iti->bookHotel[0]->hotel->name ?? "-"}}
                    </td>
                    <td>
                        @if (!empty($iti->bookHotel[0]->hotel->name))
                            @foreach ($iti->bookHotel[0]->bookRoom as $bookRoom)
                                {{$bookRoom->roomHotel->room_name}} x {{$bookRoom->quantity}}
                            @endforeach
                        @endif
                    </td>
                @endforeach
                @php
                    $rest = 5 - count($item->bookingItinerary);
                    $start = count($item->bookingItinerary) + 1;
                @endphp
                @for ($i = $start; $i <= 5; $i++)
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                @endfor
                
            </tr>
        @endforeach
    </tbody>
</table>
@php
    header('Content-Type:   application/vnd.ms-excel; charset=utf-8');
    header('Content-Disposition: attachment; filename=Schedule'.$name.'.xls'); //File name extension was wrong
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Cache-Control: private', false);
@endphp