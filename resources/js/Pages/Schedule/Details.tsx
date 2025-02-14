import React, { useState, useEffect, useRef } from 'react';
import { Copy, ChevronDown, Menu, X } from 'lucide-react';
import Main from '@/Layouts/Main';

const Detail = ({ initialData }) => {
  const [activeTab, setActiveTab] = useState('transaction');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sectionsRef = useRef({});
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const tabs = [
    { id: 'transaction', label: 'Transaction Details' },
    { id: 'booking', label: 'Booking Information' },
    { id: 'itinerary', label: 'Package Details' },
    { id: 'accommodation', label: 'Accommodation' },
    { id: 'resource', label: 'Resource Allocation' },
    { id: 'financial', label: 'Financial Data' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      let currentSection = activeTab;

      Object.entries(sectionsRef.current).forEach(([id, ref]) => {
        if (ref) {
          const { offsetTop, offsetHeight } = ref;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = id;
          }
        }
      });

      if (currentSection !== activeTab) {
        setActiveTab(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const scrollToSection = (sectionId) => {
    const section = sectionsRef.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const CopyButton = ({ text, id }) => {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };

    return (
      <div className="relative inline-flex items-center">
        <button
          onClick={handleCopy}
          className="ml-2 p-1 rounded-full transition-all duration-200 hover:bg-gray-100"
          aria-label={copiedId === id ? "Copied!" : "Copy to clipboard"}
        >
          <Copy size={16} className="text-gray-500" />
        </button>
        {copiedId === id && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg animate-fade-in">
            Copied!
          </div>
        )}
      </div>
    );
  };

  const DetailRow = ({ label, value, copyable }) => (
    <div className="flex items-start py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
      <div className="w-1/3 text-sm text-gray-600">{label}</div>
      <div className="w-2/3 text-sm flex items-center">
        <span className="text-gray-900">{value || '-'}</span>
        {copyable && value !== '-' && <CopyButton text={value} id={`${label}-${value}`} />}
      </div>
    </div>
  );

  return (
    <Main>
      <div className="flex flex-col lg:flex-row gap-5 p-4">
        {/* Sidebar */}
        <div className="lg:w-64 w-full">
          <div className="sticky top-30 bg-white rounded-lg shadow-sm">
            <nav className="p-4" role="navigation" aria-label="Main navigation">
              <div className="lg:hidden flex justify-between items-center">
                <h2 className="font-bold">Navigation</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block space-y-1`}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      scrollToSection(tab.id);
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Client Information */}
          <div
            ref={el => sectionsRef.current['transaction'] = el}
            className="bg-white rounded-lg shadow-sm mb-6 transition-all duration-200 hover:shadow-md"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Client Information</h2>
              <DetailRow
                label="CLIENT ID"
                value={initialData.client_information.client_id.toString()}
                copyable
              />
              {initialData.booking_information.order_channel !== 'TWT' && (
                <>
                  <DetailRow
                    label="CLIENT NAME"
                    value={initialData.client_information.client_name}
                  />
                  <DetailRow
                    label="CONTACT"
                    value={initialData.client_information.contact_number}
                    copyable
                  />
                  <DetailRow
                    label="EMAIL"
                    value={initialData.client_information.email_address}
                    copyable
                  />
                  <DetailRow
                    label="NATIONALITY"
                    value={initialData.client_information.nationality}
                  />
                </>
              )}
            </div>
          </div>

          {/* Booking Information */}
          <div
            ref={el => sectionsRef.current['booking'] = el}
            className="bg-white rounded-lg shadow-sm mb-6 transition-all duration-200 hover:shadow-md"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Booking Information</h2>
              <DetailRow
                label="BOOKING ID"
                value={initialData.booking_information.booking_id}
                copyable
              />
              <DetailRow
                label="REFERENCE ID"
                value={initialData.booking_information.booking_reference_id}
                copyable
              />
              <DetailRow
                label="BOOKING DATE"
                value={initialData.booking_information.booking_date}
              />
              <DetailRow
                label="ORDER CHANNEL"
                value={initialData.booking_information.order_channel}
              />
              <DetailRow
                label="TOUR PACKAGE"
                value={initialData.booking_information.tour_package}
              />
              <DetailRow
                label="PARTICIPANTS"
                value={`${initialData.booking_information.number_of_participants} PAX`}
              />
              <DetailRow
                label="TRAVEL DATE"
                value={initialData.booking_information.travel_date}
              />
              <DetailRow
                label="TRAVEL T-SHIRT"
                value={initialData.booking_information.tshirt}
              />
              {initialData.booking_information.pickup.location === 'Others' ? (
                <DetailRow
                  label="PICKUP LOCATION"
                  value={initialData.booking_information.pickup.location_value}
                />
              ) : (
                <DetailRow
                  label="PICKUP LOCATION"
                  value={`${initialData.booking_information.pickup.location}${
                    initialData.booking_information.pickup.arrival ? 
                    `, ${initialData.booking_information.pickup.arrival}` : 
                    ''} (${initialData.booking_information.pickup.location_value})`}
                />
              )}
              <DetailRow
                label="PICKUP TIME"
                value={initialData.booking_information.pickup.time}
              />
              {initialData.booking_information.drop.location === 'Others' ? (
                <DetailRow
                  label="DROP LOCATION"
                  value={initialData.booking_information.drop.location_value}
                />
              ) : (
                <DetailRow
                  label="DROP LOCATION"
                  value={`${initialData.booking_information.drop.location}${
                    initialData.booking_information.drop.arrival ? 
                    `, ${initialData.booking_information.drop.arrival}` : 
                    ''} (${initialData.booking_information.drop.location_value})`}
                />
              )}
              <DetailRow
                label="DROP TIME"
                value={initialData.booking_information.drop.time}
              />
            </div>
          </div>

          {/* Package Details */}
          <div
            ref={el => sectionsRef.current['itinerary'] = el}
            className="bg-white rounded-lg shadow-sm mb-6 transition-all duration-200 hover:shadow-md"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Package Details</h2>
              {initialData.booking_information.order_channel == 'JVTO' ? (
                <div className="space-y-6">
                  {/* Day 1 */}
                  <div>
                    <h3 className="font-medium mb-3">
                      Day {initialData.package_information[0].day}
                    </h3>
                    <div className="space-y-4">
                      {initialData.package_information[0].details.map((detail, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          {detail.icon && (
                            <img
                              src={detail.icon}
                              alt=""
                              className="w-6 h-6 mt-1"
                              aria-hidden="true"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-medium">{detail.activity}</span>
                              {detail.time && (
                                <span className="text-sm text-gray-500">({detail.time})</span>
                              )}
                            </div>
                            {detail.location && (
                              <div className="text-sm text-gray-700">
                                Location: {detail.location}
                              </div>
                            )}
                            {detail.notes && (
                              <div className="text-sm text-gray-600 mt-1">
                                {detail.notes}
                              </div>
                            )}
                            {detail.activity_notes && (
                              <div className="text-sm text-gray-500 mt-1">
                                {detail.activity_notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Show More Details */}
                  {showMoreDetails && (
                    <div className="mt-6">
                      {initialData.package_information.slice(1).map((day, index) => (
                        <div key={index} className="mb-6">
                          <h3 className="font-medium mb-3">Day {day.day}</h3>
                          <div className="space-y-4">
                            {day.details.map((detail, detailIndex) => (
                              <div
                                key={detailIndex}
                                className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              >
                                {detail.icon && (
                                  <img
                                    src={detail.icon}
                                    alt=""
                                    className="w-6 h-6 mt-1"
                                    aria-hidden="true"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-baseline gap-2">
                                    <span className="font-medium">{detail.activity}</span>
                                    {detail.time && (
                                      <span className="text-sm text-gray-500">
                                        ({detail.time})
                                      </span>
                                    )}
                                  </div>
                                  {detail.location && (
                                    <div className="text-sm text-gray-700">
                                      Location: {detail.location}
                                    </div>
                                  )}
                                  {detail.notes && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      {detail.notes}
                                    </div>
                                  )}
                                  {detail.activity_notes && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      {detail.activity_notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Toggle Button */}
                  <button
                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                    className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 flex items-center justify-center gap-2 transition-colors duration-200"
                    aria-expanded={showMoreDetails}
                  >
                    {showMoreDetails ? 'Show Less' : 'Show More Details'}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showMoreDetails ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {initialData.itinerary_information.map((day, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <h3 className="font-medium mb-1">Day {day.day} - {day.date}</h3>
                      <div className="text-sm text-gray-600">{day.itinerary}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Accommodation */}
          <div
            ref={el => sectionsRef.current['accommodation'] = el}
            className="bg-white rounded-lg shadow-sm mb-6 transition-all duration-200 hover:shadow-md"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Accommodation</h2>
              <div className="space-y-4">
                {initialData.accommodation_information.map((acc, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <h3 className="font-medium mb-2">Day {acc.day} - {acc.hotel}</h3>
                    <div className="text-sm text-gray-600">
                      <div className="mb-2">Check-in: {acc.check_in}</div>
                      <div className="space-y-1">
                        {acc.rooms.map((room, roomIndex) => (
                          <div key={roomIndex} className="flex items-center gap-2">
                            <span className="font-medium">{room.quantity}x</span>
                            <span>{room.room_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resource Allocation */}
          <div
            ref={el => sectionsRef.current['resource'] = el}
            className="bg-white rounded-lg shadow-sm mb-6 transition-all duration-200 hover:shadow-md"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Resource Allocation</h2>
              <DetailRow
                label="VEHICLE"
                value={initialData.resource_allocation_information.cars.join(', ')}
              />
              <DetailRow
                label="DRIVER"
                value={initialData.resource_allocation_information.crews.driver.join(', ')}
              />
              <DetailRow
                label="IJEN GUIDE"
                value={initialData.resource_allocation_information.crews.ijen.join(', ')}
              />
              <DetailRow
                label="ESCORT"
                value={initialData.resource_allocation_information.crews.escort.length ?
                  initialData.resource_allocation_information.crews.escort.join(', ') : '-'}
              />
            </div>
          </div>

          {/* Financial Data */}
          <div
            ref={el => sectionsRef.current['financial'] = el}
            className="bg-white rounded-lg shadow-sm mb-6 transition-all duration-200 hover:shadow-md"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Financial Data</h2>
              <DetailRow
                label="TOTAL INVOICE"
                value={formatCurrency(initialData.financial_data.invoice.total)}
              />
              {initialData.booking_information.order_channel !== 'TWT' && (
                <>
                  <DetailRow
                    label="TOTAL PAYMENT"
                    value={formatCurrency(initialData.financial_data.payment)}
                  />
                  <DetailRow
                    label="BALANCE"
                    value={`${formatCurrency(initialData.financial_data.balance)} (PAYMENT METHOD: ${
                      initialData.financial_data.paymentMethod
                    })`}
                  />
                </>
              )}
              <div className="flex items-start py-3 border-b border-gray-200">
                <div className="w-1/3 text-sm text-gray-600">EXPENSE</div>
                <div className="w-2/3 text-sm flex items-center">
                  <a
                    href={initialData.financial_data.expense.expenseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                  >
                    {formatCurrency(initialData.financial_data.expense.total)}
                  </a>
                </div>
              </div>
              <DetailRow
                label="PROFIT"
                value={formatCurrency(initialData.financial_data.profit)}
              />

              {/* Payment History */}
              {initialData.financial_data.payment_history.length > 0 && (
                <>
                  <div className="mt-6 mb-3">
                    <h3 className="text-lg font-bold">Payment History</h3>
                  </div>
                  <div className="space-y-4">
                    {initialData.financial_data.payment_history.map((payment, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{payment.description}</span>
                          <span>{formatCurrency(payment.nominal)}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Method: {payment.paymentMethod}</div>
                          <div>Date: {payment.date}</div>
                          {payment.reference && (
                            <div>
                              Reference:
                              <a
                                href={payment.reference}
                                className="text-blue-600 ml-1 hover:text-blue-700 hover:underline transition-colors duration-200"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Receipt
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {/* <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-top z-50">
        <div className="flex justify-around p-2 border-t border-gray-200">
          {tabs.slice(0, 4).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                scrollToSection(tab.id);
                setActiveTab(tab.id);
              }}
              className={`p-2 rounded-full transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600'
              }`}
              aria-label={tab.label}
            >
              <span className="text-xs">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div> */}
    </Main>
  );
};

export default Detail;