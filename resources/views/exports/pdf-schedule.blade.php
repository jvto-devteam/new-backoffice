<style>
    @page{
        padding : 5px;
        margin : 5px;
        font-size: 12px;
    }
    body{
        font-size: 12px;
        padding : 5px;
        margin : 5px;
    }
    td{
        vertical-align: top
    }
    *,body{
        font-family: 'Verdana', sans-serif;
    }
</style>
<center>
    <h1>
        <b>Period : {{date('d',strtotime($filters['startDate']))}} - {{date('d M Y',strtotime($filters['endDate']))}}</b>
    </h1>
</center>
<br>
<table cellspacing="0" cellpadding="5" width="100%" border="1" class="table table-custom">
    <thead>
        <tr bgcolor='#3c4099' style="color:white;font-weight:bold">
            <td width="3%">#</td>
            <td width="7%">DATE</td>
            <td width="10%">GUEST & PACKAGE</td>
            <td width="7%">PICK UP</td>
            <td width="18%">ITINERARY</td>
            <td width="18%">HOTEL</td>
            <td width="10%">SERVICE</td>
            <td width="7%">DROP</td>
            <td width="10%">CAR/DRIVER</td>
            <td width="10%">NOTE</td>
            {{-- <td width="6%">Option</td> --}}
        </tr>
    </thead>
        @php
            function hexToRgb($hexColor) {
                $hexColor = str_replace('#', '', $hexColor);
                $decimalColor = hexdec($hexColor);

                $red = ($decimalColor >> 16) & 0xFF;
                $green = ($decimalColor >> 8) & 0xFF;
                $blue = $decimalColor & 0xFF;

                return "rgba($red,$green,$blue,0.4)";
            }

        @endphp
        @foreach ($bookingReal as $item)
            @php
                $count = $booking->where('travel_date_start', $item->travel_date_start)->count();
                $hash = substr(md5($item->travel_date_start),0,6); // Generate a hash based on the date
                $hash = hexToRgb($hash);
                $backgroundColor = $count > 1 ? "style=background:$hash" : '';
            @endphp
            <tr data-id="{{$item->id}}" onclick="getDetails({{ $item->id }})">
                <td {{ $backgroundColor }}>
                    {{$loop->iteration}}
                </td>
                <td>
                    {{strtoupper(date('D',strtotime($item->travel_date_start)))}}
                    <br>
                    {{date('d',strtotime($item->travel_date_start))}} - {{date('d',strtotime($item->travel_date_end))}}
                </td>
                <td>
                    {{ $item->user->name }}
                    <br>
                    {{$item->package_duration}}D {{$item->package_duration - 1}}N / {{$item->total_pax}} PAX
                    <br>
                    @if ($item->agent_id == 1)
                        @php
                            $agentName = "TWT";
                        @endphp
                        <span class="badge d-block fs-14" style="background:#f6c23e;color:black">
                    @elseif ($item->agent_id == 2)
                            @if ($item->booking_category_id == 3)
                                @php
                                    $agentName = "KLOOK";
                                @endphp
                                <span class="badge d-block fs-14" style="background:#ff8200;color:black">
                            @else
                                @php
                                    $agentName = "JVTO";
                                @endphp
                                <span class="badge d-block fs-14" style="background:#4099ff;color:white">
                            @endif
                    @endif
                        {{$agentName}}
                    </span>                                        
                </td>
                <td>
                    {{$item->pickup}}
                    <br>
                    {{$item->pickup_time ? date('H:i',strtotime($item->pickup_time)) : ''}}
                </td>
                <td>
                    @foreach ($item->bookingItinerary as $data)
                        # {{$data->day}} : {{$data->itinerary}}
                        <br>
                    @endforeach
                </td>
                <td>
                    @foreach ($item->bookingItinerary as $data)
                        @php
                            $dayDate = $data->day - 1;
                            $date = date('d',strtotime($item->travel_date_start." +$dayDate days"));
                        @endphp
                        @foreach ($data->bookHotel as $dataHotel)
                            @php
                                $bg = $dataHotel->hotel->area ?  $dataHotel->hotel->area->color : 'black'
                            @endphp
                            <div style="margin-bottom:5px">
                                <span class="mb-1 badge fs-14 text-left {{ $bg == '' ? 'color-black' : 'color-white' }} d-block text-uppercase" style="background : {{ $bg }};color:white;margin-bottom:5px;">
                                    <b>
                                        # {{sprintf("%02s", $date)}} : {{strtoupper($dataHotel->bookRoom[0]->roomHotel->hotel->short_name ? $dataHotel->bookRoom[0]->roomHotel->hotel->short_name : $dataHotel->bookRoom[0]->roomHotel->hotel->name)}}
                                    </b>
                                </span>
                            </div>
                        @endforeach
                    @endforeach
                </td>
                <td>
                    @if ($item->bookingDetail[0]->xss || $item->bookingDetail[0]->xxs || $item->bookingDetail[0]->xs || $item->bookingDetail[0]->s || $item->bookingDetail[0]->m || $item->bookingDetail[0]->l || $item->bookingDetail[0]->xl || $item->bookingDetail[0]->xxl || $item->bookingDetail[0]->xxxl)
                    <div style="margin-bottom:5px">
                        <b class="text-left d-block badge fs-14" style="background: #000;color:white;margin-bottom:5px">
                    @endif
                        {{$item->bookingDetail[0]->xss ? 'XSS-'.$item->bookingDetail[0]->xss.'; ' : ''}}
                        {{$item->bookingDetail[0]->xxs ? 'XXS-'.$item->bookingDetail[0]->xxs.'; ' : ''}}
                        {{$item->bookingDetail[0]->xs ? 'XS-'.$item->bookingDetail[0]->xs.'; ' : ''}}
                        {{$item->bookingDetail[0]->s ? 'S-'.$item->bookingDetail[0]->s.'; ' : ''}}
                        {{$item->bookingDetail[0]->m ? 'M-'.$item->bookingDetail[0]->m.'; ' : ''}}
                        {{$item->bookingDetail[0]->l ? 'L-'.$item->bookingDetail[0]->l.'; ' : ''}}
                        {{$item->bookingDetail[0]->xl ? 'XL-'.$item->bookingDetail[0]->xl.'; ' : ''}}
                        {{$item->bookingDetail[0]->xxl ? 'XXL-'.$item->bookingDetail[0]->xxl.'; ' : ''}}
                        {{$item->bookingDetail[0]->xxxl ? 'XXXL-'.$item->bookingDetail[0]->xxxl.'; ' : ''}}
                    @if ($item->bookingDetail[0]->xss || $item->bookingDetail[0]->xxs || $item->bookingDetail[0]->xs || $item->bookingDetail[0]->s || $item->bookingDetail[0]->m || $item->bookingDetail[0]->l || $item->bookingDetail[0]->xl || $item->bookingDetail[0]->xxl || $item->bookingDetail[0]->xxxl)
                        </b>
                    </div>                        
                    @endif
                    @foreach ($item->bookingItinerary as $data)
                        @php
                            $dayDate = $data->day - 1;
                            $date = date('d',strtotime($item->travel_date_start." +$dayDate days"));
                        @endphp
                        @foreach ($data->bookHotel as $dataHotel)
                        @php
                            $bg = $dataHotel->hotel->area ?  $dataHotel->hotel->area->color : 'black'
                        @endphp
                            @foreach ($dataHotel->bookRoom as $dataRoom)
                            <div style="margin-bottom:5px">
                                <span class="mb-1 badge fs-14 text-left {{ $bg == '' ? 'color-black' : 'color-white' }} d-block text-uppercase" style="background : {{ $bg }};color:white;margin-bottom:5px">
                                    <b>
                                        {{strtoupper($dataRoom->roomHotel->room_type ? $dataRoom->roomHotel->room_type : $dataRoom->roomHotel->room_name)}} x {{$dataRoom->quantity}} 
                                    </b>
                                </span>
                            </div>
                            @endforeach
                        @endforeach
                    @endforeach                        
                </td>
                <td>
                    {{$item->drop}}
                    <br>
                    {{$item->drop_time ? date('H:i',strtotime($item->drop_time)) : ''}}
                </td>
                <td class="text-uppercase">
                    @if (count($item->bookCar) != 0)
                            @php
                                $carId = '';
                            @endphp
                            @foreach ($item->bookCar as $keyCar => $car)
                            <div style="margin-bottom:5px">
                                <span class="mb-1 badge fs-14 bg-primary text-left color-white d-block text-uppercase" style="background: #3c4099;color:white;margin-bottom:5px">
                                    @php
                                        $comaCar = $keyCar + 1 != count($item->bookCar) ? ',' : '';
                                        $carId .= $car->car_id . $comaCar;
                                    @endphp
                                    <b>
                                        {{ strtoupper($car->car->name) }}
                                    </b>
                                </span>
                            </div>
                            @endforeach
                    @endif
                    @php
                        $getGuideDriver = $item->guideDriver->toArray();
                        $driver = array_filter($getGuideDriver, function ($var) {
                            return $var['type'] == 'driver';
                        });
                        $driverId = '';
                        $keyDriver = 0;
                    @endphp
                    @if (count($driver) != 0)
                            @foreach ($driver as $keyDriver => $d)
                                @php
                                    $coma = $keyDriver + 1 != count($driver) ? ',' : '';
                                    $driverId .= $d['guide_id'] . $coma;
                                @endphp
                                <div style="margin-bottom:5px">
                                    <span class="mb-1 badge fs-14 bg-danger text-left color-white d-block" style="background: #e80028;color:white;margin-bottom:5px">
                                        <b>
                                            {{ strtoupper($d['person']['name']) }}
                                        </b>
                                    </span>
                                </div>
                            @endforeach
                    @endif
                    @php
                        $getGuideDriver = $item->guideDriver->toArray();
                        $guide = array_filter($getGuideDriver, function ($var) {
                            return $var['type'] == 'guide';
                        });
                        $guideId = '';
                        $guideType = '';
                        $keyGuide = 0;
                        $atBondowoso = date('d', strtotime($item->at_bondowoso));
                        $atBondowoso2 = date('d', strtotime($item->at_bondowoso . ' +1 day'));
                    @endphp
                    @if (count($guide) != 0)
                            @foreach ($guide as $keyGuide => $d)
                                @php
                                    $coma = $keyGuide + 1 != count($guide) ? ',' : '';
                                    $guideId .= $d['guide_id'] . $coma;
                                    $guideType .= $d['guide_ijen'] . $coma;
                                @endphp
                                <div style="margin-bottom:5px">
                                    <span class="badge fs-14 bg-info text-left color-black d-block text-uppercase"  style="background:  #36b9cc;color:white;margin-bottom:5px">
                                        {{-- <span class="{{ $d['guide_ijen'] == '1' ? 'text-info' : 'color-orange' }}"> --}}
                                            <b>
                                                {{ strtoupper($d['person']['name']) }}
                                                {{ strtoupper($d['guide_ijen'] == '1' ? " (Ijen)" : '') }}
                                            </b>
                                        {{-- </span> --}}
                                    </span>
                                </div>
                            @endforeach
                    @endif
                </td>
                <td>{{$item->note}}</td>
                {{-- <td>
                    @if ($item->is_shuttle == '1')
                        @php
                            $travelEndDate = date('Y-m-d', strtotime($item->travel_date_end . ' -1 day'));
                        @endphp
                    @else
                        @php
                            $travelEndDate = $item->travel_date_end;
                        @endphp
                    @endif

                    <div class="d-flex">
                        <a href="" class="btn btn-primary btn-sm btn-details">Details</a>
                        <a href="" class="btn btn-warning btn-sm plotting"
                        data-ijen="{{ $item->at_bondowoso ? true : false }}" data-id="{{ $item->id }}"
                        data-driver="{{ $driverId }}" data-guide="{{ $guideId }}"
                        data-month="{{ date('F', strtotime($item->travel_date_start)) }}"
                        data-start="{{ $item->travel_date_start }}" data-end="{{ $travelEndDate }}"
                        data-guidetype="{{ $guideType }}" data-vehicle="{{ $carId }}"
                        data-customer="{{ $item->user->name }}" data-note="{{ $item->note }}"
                        data-pickup="{{ $item->pickup }}">Plotting</a>
                    </div>
                </td> --}}
            </tr>
        @endforeach
    </tbody>
</table>

