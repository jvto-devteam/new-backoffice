import React, { useState } from 'react';
import {
    Users, CreditCard, Calculator, TrendingUp, TrendingDown,
    Building2, Car, Coffee, Mountain, DollarSign,
    ChevronDown, Package, Wallet, FileSpreadsheet
} from 'lucide-react';

// UI Components
const Card = ({ className = '', children }) => (
    <div className={`bg-white rounded-lg shadow ${className}`}>
        {children}
    </div>
);

const CardContent = ({ className = '', children }) => (
    <div className={`p-4 ${className}`}>{children}</div>
);

const CardHeader = ({ className = '', children }) => (
    <div className={`p-4 ${className}`}>{children}</div>
);

const CardTitle = ({ className = '', children }) => (
    <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const Button = ({ variant = 'primary', className = '', children, ...props }) => {
    const baseStyle = 'px-4 py-2 rounded-lg font-medium transition-colors';
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 hover:bg-gray-50'
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

const Badge = ({ variant = 'default', className = '', children }) => {
    const variants = {
        default: 'bg-gray-100',
        outline: 'border border-gray-300',
        success: 'bg-green-100 text-green-800',
        destructive: 'bg-red-100 text-red-800'
    };

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
    );
};

export default function ExpenseCalculator() {
    const [pax, setPax] = useState(2);
    const [packageType, setPackageType] = useState('KLOOK_3D2N');
    const [selectedHotels, setSelectedHotels] = useState({
        bondowoso: 'deluxe',
        bromo: 'deluxe'
    });
    const [selectedVehicle, setSelectedVehicle] = useState('sigra');

    // Rates definition
    const rates = {
        hotels: {
            bondowoso: {
                deluxe: { rate: 275000, name: 'Baratha Hotel - Deluxe' },
                apartment: { rate: 450000, name: 'Baratha Hotel - Apartment' }
            },
            bromo: {
                deluxe: { rate: 750000, name: 'Joglo Kecombrang - Deluxe' },
                family: { rate: 950000, name: 'Joglo Kecombrang - Family' }
            }
        },
        vehicles: {
            sigra: { rate: 200000, name: 'Sigra' },
            avanza: { rate: 250000, name: 'Toyota Avanza' }
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
            driver: { rate: 250000 },
            transport: { rate: 100000 },
            water: { rate: 50000 },
            tshirt: { rate: 60000 }
        }
    };

    const packageRates = {
        KLOOK_3D2N: {
            2: 5632000,
            3: 8160000
        }
    };

    const calculateTotals = () => {
        const bondowosoHotelCost = rates.hotels.bondowoso[selectedHotels.bondowoso].rate;
        const bromoHotelCost = rates.hotels.bromo[selectedHotels.bromo].rate;
        const accommodation = bondowosoHotelCost + bromoHotelCost;

        const ijenCost = (rates.activities.ijen.ticket * pax) + rates.activities.ijen.guide + (rates.activities.ijen.meal * pax);
        const bromoCost = (rates.activities.bromo.ticket * pax) + rates.activities.bromo.jeep;
        const madakaripuraCost = (rates.activities.madakaripura.ticket * pax) + rates.activities.madakaripura.guide;
        const activities = ijenCost + bromoCost + madakaripuraCost;

        const transport = rates.vehicles[selectedVehicle].rate * 3;

        const misc = (rates.other.driver.rate * 3) + rates.other.transport.rate + rates.other.water.rate + (rates.other.tshirt.rate * pax);

        const grandTotal = accommodation + activities + transport + misc;
        const invoice = packageRates[packageType][pax] || 0;
        const revenue = invoice - grandTotal;

        return {
            accommodation,
            activities,
            transport,
            misc,
            grandTotal,
            invoice,
            revenue,
            ijen: ijenCost,
            bromo: bromoCost,
            madakaripura: madakaripuraCost
        };
    };

    const totals = calculateTotals();
    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID').format(amount);

    const Select = ({ label, value, onChange, options, icon: Icon }) => (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                    {options.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
            </div>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, trend }) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Icon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{title}</p>
                            <h3 className="text-2xl font-bold">IDR {value}</h3>
                        </div>
                    </div>
                    {trend && (
                        <Badge variant={trend > 0 ? "success" : "destructive"} className="flex items-center gap-1">
                            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const CategoryCard = ({ title, icon: Icon, children }) => (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Icon className="w-5 h-5 text-gray-500" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {children}
            </CardContent>
        </Card>
    );

    const ExpenseRow = ({ label, amount, info }) => (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{label}</span>
                {info && (
                    <Badge variant="outline" className="text-xs">
                        {info}
                    </Badge>
                )}
            </div>
            <span className="font-medium">IDR {formatCurrency(amount)}</span>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                    label="Package Type"
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    options={[{ value: 'KLOOK_3D2N', label: 'KLOOK 3D2N' }]}
                    icon={Package}
                />
                <Select
                    label="Number of Pax"
                    value={pax}
                    onChange={(e) => setPax(Number(e.target.value))}
                    options={Array.from({ length: 9 }, (_, i) => ({
                        value: i + 2,
                        label: `${i + 2} Pax`
                    }))}
                    icon={Users}
                />
                <div className="md:col-span-2 flex justify-end gap-3">
                    <Button variant="outline" className="gap-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Excel
                    </Button>
                    <Button className="gap-2">
                        <Calculator className="w-4 h-4" />
                        Calculate
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Expenses"
                    value={formatCurrency(totals.grandTotal)}
                    icon={Wallet}
                    trend={-2.5}
                />
                <StatCard
                    title="Invoice Amount"
                    value={formatCurrency(totals.invoice)}
                    icon={CreditCard}
                />
                <StatCard
                    title="Revenue"
                    value={formatCurrency(totals.revenue)}
                    icon={DollarSign}
                    trend={5.2}
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CategoryCard title="Accommodation" icon={Building2}>
                    <div className="space-y-4">
                        <Select
                            label="Bondowoso Hotel"
                            value={selectedHotels.bondowoso}
                            onChange={(e) => setSelectedHotels({...selectedHotels, bondowoso: e.target.value})}
                            options={[
                                { value: 'deluxe', label: 'Baratha Hotel - Deluxe' },
                                { value: 'apartment', label: 'Baratha Hotel - Apartment' }
                            ]}
                        />
                        <Select
                            label="Bromo Hotel"
                            value={selectedHotels.bromo}
                            onChange={(e) => setSelectedHotels({...selectedHotels, bromo: e.target.value})}
                            options={[
                                { value: 'deluxe', label: 'Joglo Kecombrang - Deluxe' },
                                { value: 'family', label: 'Joglo Kecombrang - Family' }
                            ]}
                        />
                        <ExpenseRow
                            label="Total Accommodation"
                            amount={totals.accommodation}
                        />
                    </div>
                </CategoryCard>

                <CategoryCard title="Activities" icon={Mountain}>
                    <div className="space-y-2">
                        <ExpenseRow
                            label="Ijen Package"
                            amount={totals.ijen}
                            info={`${pax} pax`}
                        />
                        <ExpenseRow
                            label="Bromo Package"
                            amount={totals.bromo}
                            info={`${pax} pax`}
                        />
                        <ExpenseRow
                            label="Madakaripura Package"
                            amount={totals.madakaripura}
                            info={`${pax} pax`}
                        />
                        <div className="pt-2 mt-2 border-t">
                            <ExpenseRow
                                label="Total Activities"
                                amount={totals.activities}
                            />
                        </div>
                    </div>
                </CategoryCard>

                <CategoryCard title="Transportation" icon={Car}>
                    <div className="space-y-4">
                        <Select
                            label="Vehicle Type"
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.target.value)}
                            options={[
                                { value: 'sigra', label: 'Sigra' },
                                { value: 'avanza', label: 'Toyota Avanza' }
                            ]}
                        />
                        <ExpenseRow
                            label={`${rates.vehicles[selectedVehicle].name}`}
                            amount={totals.transport}
                            info="3 days"
                        />
                    </div>
                </CategoryCard>

                <CategoryCard title="Miscellaneous" icon={Coffee}>
                    <div className="space-y-2">
                        <ExpenseRow
                            label="Driver"
                            amount={rates.other.driver.rate * 3}
                            info="3 days"
                        />
                        <ExpenseRow
                            label="Transport Allowance"
                            amount={rates.other.transport.rate}
                        />
                        <ExpenseRow
                            label="Mineral Water"
                            amount={rates.other.water.rate}
                        />
                        <ExpenseRow
                            label="T-shirt"
                            amount={rates.other.tshirt.rate * pax}
                            info={`${pax} pax`}
                        />
                        <div className="pt-2 mt-2 border-t">
                            <ExpenseRow
                                label="Total Miscellaneous"
                                amount={totals.misc}
                            />
                        </div>
                    </div>
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
                            <p className="text-2xl font-bold">IDR {formatCurrency(totals.invoice)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Net Revenue</p>
                            <p className="text-2xl font-bold text-green-600">IDR {formatCurrency(totals.revenue)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
