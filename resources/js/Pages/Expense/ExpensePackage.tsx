import Main from '@/Layouts/Main';
import React, {useState, useEffect} from 'react';
import SwitcherOne from '../../components/Switchers/SwitcherOne';
import {
    Users, CreditCard, Calculator, TrendingUp, TrendingDown,
    Building2, Car, Coffee, Mountain, DollarSign,
    ChevronDown, Package, Wallet, FileSpreadsheet
} from 'lucide-react';

// Basic Card Components
const Card = ({className = '', children}) => (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader = ({className = '', children}) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

const CardTitle = ({className = '', children}) => (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
        {children}
    </h3>
);

const CardContent = ({className = '', children}) => (
    <div className={`p-6 pt-0 ${className}`}>
        {children}
    </div>
);

// Button Component
const Button = ({variant = 'default', className = '', children, ...props}) => {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors';
    const variantStyles = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

// Badge Component
const Badge = ({variant = 'default', className = '', children}) => {
    const baseStyles = 'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1';
    const variantStyles = {
        default: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        destructive: 'bg-red-100 text-red-800',
        outline: 'border border-gray-300 text-gray-600'
    };

    return (
        <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
    );
};
export default function ExpensePackage() {
    // State definitions
    const [pax, setPax] = useState(2);
    const [packageType, setPackageType] = useState('KLOOK_3D2N');
    const [selectedHotels, setSelectedHotels] = useState({
        bondowoso: 'deluxe',
        bromo: 'deluxe'
    });
    const [selectedVehicle, setSelectedVehicle] = useState('sigra');
    const [days, setDays] = useState(3);
    const [hotelNights, setHotelNights] = useState({
        bondowoso: 1,
        bromo: 1
    });
    const [activityQty, setActivityQty] = useState({
        ijenTicket: null,
        ijenGuide: null,
        ijenMeal: null,
        bromoTicket: null,
        bromoJeep: null,
        madakaripuraTicket: null,
        madakaripuraGuide: null
    });

    const [miscQty, setMiscQty] = useState({
        driver: null,
        transport: null,
        water: null,
        tshirt: null,
        toll: null
    });
    // Rates definition
    const rates = {
        hotels: {
            bondowoso: {
                deluxe: {rate: 275000, name: 'Baratha Hotel - Deluxe'},
                apartment: {rate: 450000, name: 'Baratha Hotel - Apartment'}
            },
            bromo: {
                deluxe: {rate: 750000, name: 'Joglo Kecombrang - Deluxe'},
                family: {rate: 950000, name: 'Joglo Kecombrang - Family'}
            }
        },
        vehicles: {
            sigra: {rate: 200000, name: 'Sigra'},
            avanza: {rate: 250000, name: 'Toyota Avanza'},
            hiace: {rate: 1100000, name: 'Toyota Hiace'}
        },
        activities: {
            ijen: {
                ticket: 75000,
                guide: 250000,
                meal: 25000
            },
            bromo: {
                ticket: 150000,
                jeep: 500000
            },
            madakaripura: {
                ticket: 90000,
                guide: 100000
            }
        },
        other: {
            driver: {rate: 250000},
            transport: {rate: 100000},
            water: {rate: 50000},
            tshirt: {rate: 60000},
            toll: {rate: 200000},
        }
    };

    const packageRates = {
        KLOOK_3D2N: {
            2: 2816000,
            3: 2580000,
            4: 2400000,
            5: 2400000,
            6: 2240000,
            7: 2240000,
            8: 2000000,
            9: 2000000,
            10: 2000000,
        }
    };
// Utility function for formatting currency
    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID').format(amount);

// Function to calculate quantities based on formulas
    const calculateQuantities = () => {
        return {
            accommodation: {
                bondowoso: hotelNights.bondowoso,
                bromo: hotelNights.bromo
            },
            activities: {
                ijenTicket: activityQty.ijenTicket ?? pax,
                ijenGuide: activityQty.ijenGuide ?? 1,
                ijenMeal: activityQty.ijenMeal ?? pax,
                bromoTicket: activityQty.bromoTicket ?? pax,
                bromoJeep: activityQty.bromoJeep ?? Math.ceil(pax / 4),
                madakaripuraTicket: activityQty.madakaripuraTicket ?? pax,
                madakaripuraGuide: activityQty.madakaripuraGuide ?? 1
            },
            misc: {
                driver: miscQty.driver ?? days,
                transport: miscQty.transport ?? days,
                water: miscQty.water ?? Math.ceil((pax * days * 3) / 24),
                tshirt: miscQty.tshirt ?? pax,
                toll: miscQty.toll ?? 1
            },
            transport: days
        };
    };

// Get dynamic quantities
    const quantities = calculateQuantities();

// Select Component
    const Select = ({label, value, onChange, options, icon: Icon}) => (
        <div>
            {label ? (
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    {Icon && <Icon className="w-4 h-4 text-gray-500"/>}
                    {label}
                </label>
            ) : ''}
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                    {options.map(({value, label}) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500"/>
            </div>
        </div>
    );

    const Input = ({label, value, placeholder, icon: Icon, type = "text"}) => (
        <div>
            {label && (
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    {Icon && <Icon className="w-4 h-4 text-gray-500"/>}
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );

// Quantity Input Component
    const QuantityInput = ({value, onChange, min = 1, max = 99}) => (
        <input
            type="number"
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
    );

    const [switch1Enabled, setSwitch1Enabled] = useState(false);
    const [switch2Enabled, setSwitch2Enabled] = useState(false);
    const [switch3Enabled, setSwitch3Enabled] = useState(false);

    const toggleSwitcher = (id) => {
        setSwitcherStates((prevState) =>
            prevState.map((switcher) =>
                switcher.id === id
                    ? {...switcher, enabled: !switcher.enabled}
                    : switcher
            )
        );
    };

// Expense Row Componen
    const ExpenseRow = ({
                            label,
                            rate,
                            quantity,
                            total,
                            formula,
                            showQuantityInput = false,
                            onQuantityChange = null,
                        }) => {
        const [isSwitchEnabled, setIsSwitchEnabled] = useState(false); // Individual state for each switch

        return (
            <div className="grid grid-cols-12 gap-4 py-2 text-sm">
                <div className="col-span-4">
                    <span className="text-gray-700">{label}</span>
                    {/* {formula && (
                <span className="block text-xs text-gray-500">
                    {formula}
                </span>
                )} */}
                </div>
                <div className="col-span-2 text-center text-gray-600">
                    {rate ? `${formatCurrency(rate)}` : ''}
                </div>
                <div className="col-span-2 text-center text-gray-600">
                    {showQuantityInput && onQuantityChange ? (
                        <QuantityInput
                            value={quantity}
                            onChange={onQuantityChange}
                        />
                    ) : (
                        quantity
                    )}
                </div>
                <div className="col-span-2 text-right font-medium">
                    IDR {formatCurrency(total)}
                </div>
                <div className="col-span-2 text-right font-medium">
                    <SwitcherOne
                        id={`switcher-${label}`} // Unique ID based on label
                        enabled={isSwitchEnabled} // Controlled state for each switch
                        onChange={() => setIsSwitchEnabled(!isSwitchEnabled)} // Toggle state
                    />
                </div>
            </div>
        );
    };
// Calculate all totals
    const calculateTotals = () => {
        const bondowosoHotelCost = rates.hotels.bondowoso[selectedHotels.bondowoso].rate * quantities.accommodation.bondowoso;
        const bromoHotelCost = rates.hotels.bromo[selectedHotels.bromo].rate * quantities.accommodation.bromo;
        const accommodation = bondowosoHotelCost + bromoHotelCost;

        const transport = rates.vehicles[selectedVehicle].rate * quantities.transport;

        const ijenCost = (rates.activities.ijen.ticket * quantities.activities.ijenTicket) +
            (rates.activities.ijen.guide * quantities.activities.ijenGuide) +
            (rates.activities.ijen.meal * quantities.activities.ijenMeal);

        const bromoCost = (rates.activities.bromo.ticket * quantities.activities.bromoTicket) +
            (rates.activities.bromo.jeep * quantities.activities.bromoJeep);

        const madakaripuraCost = (rates.activities.madakaripura.ticket * quantities.activities.madakaripuraTicket) +
            (rates.activities.madakaripura.guide * quantities.activities.madakaripuraGuide);

        const activities = ijenCost + bromoCost + madakaripuraCost;

        const misc = (rates.other.driver.rate * quantities.misc.driver) +
            (rates.other.transport.rate * quantities.misc.transport) +
            (rates.other.water.rate * quantities.misc.water) +
            (rates.other.tshirt.rate * quantities.misc.tshirt) +
            (rates.other.toll.rate * quantities.misc.toll);

        const grandTotal = accommodation + activities + transport + misc;
        const invoice = packageRates[packageType][pax] * pax || 0;
        const revenue = invoice - grandTotal;

        return {
            accommodation,
            activities,
            transport,
            misc,
            grandTotal,
            invoice,
            revenue,
            bondowosoHotelCost,
            bromoHotelCost,
            ijenCost,
            bromoCost,
            madakaripuraCost
        };
    };

    // Get totals
    const totals = calculateTotals();

    // Stat Card Component
    const StatCard = ({title, value, icon: Icon, trend}) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Icon className="w-6 h-6 text-blue-500"/>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{title}</p>
                            <h3 className="text-2xl font-bold">IDR {value}</h3>
                        </div>
                    </div>
                    {trend && (
                        <Badge variant={trend > 0 ? "success" : "destructive"} className="flex items-center gap-1">
                            {trend > 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                            {Math.abs(trend)}%
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    // Category Card Component
    const CategoryCard = ({title, icon: Icon, children}) => (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Icon className="w-5 h-5 text-gray-500"/>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
// Accommodation Content Component
    const AccommodationContent = () => (
        <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 pb-2 text-sm font-medium text-gray-500">
                <div className="col-span-4">Item</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-2 text-center">Nights</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-center">Hutang</div>
            </div>

            <ExpenseRow
                label={
                    <Select
                        value={selectedHotels.bondowoso}
                        onChange={(e) => setSelectedHotels({...selectedHotels, bondowoso: e.target.value})}
                        options={[
                            {value: 'deluxe', label: 'Baratha Hotel - Deluxe'},
                            {value: 'apartment', label: 'Baratha Hotel - Apartment'}
                        ]}
                    />
                }
                rate={rates.hotels.bondowoso[selectedHotels.bondowoso].rate}
                quantity={quantities.accommodation.bondowoso}
                formula="qty = jumlah malam"
                showQuantityInput={true}
                onQuantityChange={(e) => setHotelNights({
                    ...hotelNights,
                    bondowoso: parseInt(e.target.value) || 0
                })}
                total={rates.hotels.bondowoso[selectedHotels.bondowoso].rate * quantities.accommodation.bondowoso}
            />

            <ExpenseRow
                label={
                    <Select
                        value={selectedHotels.bromo}
                        onChange={(e) => setSelectedHotels({...selectedHotels, bromo: e.target.value})}
                        options={[
                            {value: 'deluxe', label: 'Joglo Kecombrang - Deluxe'},
                            {value: 'family', label: 'Joglo Kecombrang - Family'}
                        ]}
                    />
                }
                rate={rates.hotels.bromo[selectedHotels.bromo].rate}
                quantity={quantities.accommodation.bromo}
                formula="qty = jumlah malam"
                showQuantityInput={true}
                onQuantityChange={(e) => setHotelNights({
                    ...hotelNights,
                    bromo: parseInt(e.target.value) || 0
                })}
                total={rates.hotels.bromo[selectedHotels.bromo].rate * quantities.accommodation.bromo}
            />

            <div className="pt-2 mt-2 border-t">
                <ExpenseRow
                    label="Total Accommodation"
                    total={totals.accommodation}
                    showQuantityInput={false}
                />
            </div>
        </div>
    );

    // Activities Content Component
    const ActivitiesContent = () => (
        <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 pb-2 text-sm font-medium text-gray-500">
                <div className="col-span-4">Item</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-center">Hutang</div>
            </div>

            <ExpenseRow
                label="Ijen Crater Ticket"
                rate={rates.activities.ijen.ticket}
                quantity={quantities.activities.ijenTicket}
                formula="qty = jumlah pax"
                showQuantityInput={true}
                onQuantityChange={(e) => setActivityQty({
                    ...activityQty,
                    ijenTicket: parseInt(e.target.value) || 0
                })}
                total={rates.activities.ijen.ticket * quantities.activities.ijenTicket}
            />

            <ExpenseRow
                label="Ijen Local Guide"
                rate={rates.activities.ijen.guide}
                quantity={quantities.activities.ijenGuide}
                formula="qty = fixed 1"
                showQuantityInput={true}
                onQuantityChange={(e) => setActivityQty({
                    ...activityQty,
                    ijenGuide: parseInt(e.target.value) || 0
                })}
                total={rates.activities.ijen.guide * quantities.activities.ijenGuide}
            />

            <ExpenseRow
                label="Coffee + Indo Mee"
                rate={rates.activities.ijen.meal}
                quantity={quantities.activities.ijenMeal}
                formula="qty = jumlah pax"
                showQuantityInput={true}
                onQuantityChange={(e) => setActivityQty({
                    ...activityQty,
                    ijenMeal: parseInt(e.target.value) || 0
                })}
                total={rates.activities.ijen.meal * quantities.activities.ijenMeal}
            />

            <ExpenseRow
                label="Bromo Ticket"
                rate={rates.activities.bromo.ticket}
                quantity={quantities.activities.bromoTicket}
                formula="qty = jumlah pax"
                showQuantityInput={true}
                onQuantityChange={(e) => setActivityQty({
                    ...activityQty,
                    bromoTicket: parseInt(e.target.value) || 0
                })}
                total={rates.activities.bromo.ticket * quantities.activities.bromoTicket}
            />

            <ExpenseRow
                label="Bromo Jeep"
                rate={rates.activities.bromo.jeep}
                quantity={quantities.activities.bromoJeep}
                formula="qty = ceil(pax / 4)"
                showQuantityInput={true}
                onQuantityChange={(e) => setActivityQty({
                    ...activityQty,
                    bromoJeep: parseInt(e.target.value) || 0
                })}
                total={rates.activities.bromo.jeep * quantities.activities.bromoJeep}
            />

            <ExpenseRow
                label="Madakaripura Ticket"
                rate={rates.activities.madakaripura.ticket}
                quantity={quantities.activities.madakaripuraTicket}
                formula="qty = jumlah pax"
                showQuantityInput={true}
                onQuantityChange={(e) => setActivityQty({
                    ...activityQty,
                    madakaripuraTicket: parseInt(e.target.value) || 0
                })}
                total={rates.activities.madakaripura.ticket * quantities.activities.madakaripuraTicket}
            />

            <ExpenseRow
                label="Madakaripura Local Guide"
                rate={rates.activities.madakaripura.guide}
                quantity={quantities.activities.madakaripuraGuide}
                formula="qty = fixed 1"
                onQuantityChange={(e) => setActivityQty({
                    ...activityQty,
                    madakaripuraGuide: parseInt(e.target.value) || 0
                })}
                total={rates.activities.madakaripura.guide * quantities.activities.madakaripuraGuide}
            />

            <div className="pt-2 mt-2 border-t">
                <ExpenseRow
                    label="Total Activities"
                    total={totals.activities}
                    showQuantityInput={false}
                />
            </div>
        </div>
    );

    // Transportation Content Component
    const TransportationContent = () => (
        <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 pb-2 text-sm font-medium text-gray-500">
                <div className="col-span-4">Item</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-2 text-center">Days</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-center">Hutang</div>
            </div>

            <ExpenseRow
                label={
                    <Select
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        options={[
                            {value: 'sigra', label: 'Sigra'},
                            {value: 'avanza', label: 'Toyota Avanza'},
                            {value: 'hiace', label: 'Toyota Hiace'}
                        ]}
                    />
                }
                rate={rates.vehicles[selectedVehicle].rate}
                quantity={quantities.transport}
                formula="qty = jumlah hari"
                showQuantityInput={true}
                onQuantityChange={(e) => setDays(parseInt(e.target.value) || 0)}
                total={rates.vehicles[selectedVehicle].rate * quantities.transport}
            />

            <div className="pt-2 mt-2 border-t">
                <ExpenseRow
                    label="Total Transportation"
                    total={totals.transport}
                    showQuantityInput={false}
                />
            </div>
        </div>
    );

    // Miscellaneous Content Component
    const MiscellaneousContent = () => (
        <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 pb-2 text-sm font-medium text-gray-500">
                <div className="col-span-4">Item</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-center">Hutang</div>
            </div>

            <ExpenseRow
                label="Driver"
                rate={rates.other.driver.rate}
                quantity={quantities.misc.driver}
                formula="qty = jumlah hari"
                showQuantityInput={true}
                onQuantityChange={(e) => setMiscQty({
                    ...miscQty,
                    driver: parseInt(e.target.value) || 0
                })}
                total={rates.other.driver.rate * quantities.misc.driver}
            />

            <ExpenseRow
                label="Transport Allowance"
                rate={rates.other.transport.rate}
                quantity={quantities.misc.transport}
                formula="qty = jumlah hari"
                showQuantityInput={true}
                onQuantityChange={(e) => setMiscQty({
                    ...miscQty,
                    transport: parseInt(e.target.value) || 0
                })}
                total={rates.other.transport.rate * quantities.misc.transport}
            />

            <ExpenseRow
                label="Mineral Water"
                rate={rates.other.water.rate}
                quantity={quantities.misc.water}
                showQuantityInput={true}
                onQuantityChange={(e) => setMiscQty({
                    ...miscQty,
                    water: parseInt(e.target.value) || 0
                })}
                formula="qty = ceil((pax * days * 3) / 24)"
                total={rates.other.water.rate * quantities.misc.water}
            />

            <ExpenseRow
                label="T-shirt"
                rate={rates.other.tshirt.rate}
                quantity={quantities.misc.tshirt}
                formula="qty = jumlah pax"
                showQuantityInput={true}
                onQuantityChange={(e) => setMiscQty({
                    ...miscQty,
                    tshirt: parseInt(e.target.value) || 0
                })}
                total={rates.other.tshirt.rate * quantities.misc.tshirt}
            />

            <ExpenseRow
                label="Toll & Parking"
                rate={rates.other.toll.rate}
                quantity={quantities.misc.toll}
                formula="qty = fixed 1"
                showQuantityInput={true}
                onQuantityChange={(e) => setMiscQty({
                    ...miscQty,
                    toll: parseInt(e.target.value) || 0
                })}
                total={rates.other.toll.rate * quantities.misc.toll}
            />

            <div className="pt-2 mt-2 border-t">
                <ExpenseRow
                    label="Total Miscellaneous"
                    total={totals.misc}
                    showQuantityInput={false}
                />
            </div>
        </div>
    );
// Render Component
    return (
        <Main>
            <div className="max-w-7xl space-y-6">
                {/* Header Controls */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                    <Select
                        label="Package Type"
                        value={packageType}
                        onChange={(e) => setPackageType(e.target.value)}
                        options={[{value: 'KLOOK_3D2N', label: 'KLOOK 3D2N'}, {
                            value: 'KLOOK_4D3N1',
                            label: 'KLOOK 4D3N Surabaya - Ijen - Bromo - Mada'
                        }, {value: 'KLOOK_4D3N2', label: 'KLOOK 4D3N Surabaya - Ijen - Papuma - Tumpak Sewu - Bromo'}]}
                        icon={Package}
                    />
                    <Select
                        label="Number of Pax"
                        value={pax}
                        onChange={(e) => setPax(Number(e.target.value))}
                        options={Array.from({length: 9}, (_, i) => ({
                            value: i + 2,
                            label: `${i + 2} Pax`
                        }))}
                        icon={Users}
                    />
                    <Input
                        label="Customer Name"
                        placeholder="Enter customer name"
                        icon={Users}
                    />
                    <Input
                        label="Crew Name"
                        placeholder="Enter crew name"
                        icon={Users}
                    />
                    <div className="md:col-span-2 flex justify-end gap-2">
                        <Button className="gap-2">
                            <Calculator className="w-4 h-4"/>
                            Calculate
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <FileSpreadsheet className="w-4 h-4"/>
                            Export Excel
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard
                        title="Total Crew"
                        value={formatCurrency(totals.grandTotal)}
                        icon={Wallet}
                        trend={-2.5}
                    />
                    <StatCard
                        title="Total Hutang"
                        value={formatCurrency(totals.invoice)}
                        icon={CreditCard}
                    />

                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CategoryCard title="Accommodation" icon={Building2}>
                        <AccommodationContent/>
                    </CategoryCard>

                    <CategoryCard title="Activities" icon={Mountain}>
                        <ActivitiesContent/>
                    </CategoryCard>

                    <CategoryCard title="Transportation" icon={Car}>
                        <TransportationContent/>
                    </CategoryCard>

                    <CategoryCard title="Miscellaneous" icon={Coffee}>
                        <MiscellaneousContent/>
                    </CategoryCard>
                </div>

                {/* Summary Footer */}
                <Card className="bg-gray-50">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                                <p className="text-2xl font-bold">IDR {formatCurrency(totals.grandTotal)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Invoice Amount</p>
                                <p className="text-2xl font-bold">IDR {formatCurrency(totals.invoice)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Expected Revenue</p>
                                <p className={`text-2xl font-bold ${totals.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    IDR {formatCurrency(totals.revenue)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Main>
    );
}
