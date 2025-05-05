import React, { useState, useEffect, useRef } from 'react';
import { Copy, ChevronDown, Menu, X, Pencil, Eye, Download,Users } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import {Toast} from '@/utils/swal';

import Main from '@/Layouts/Main';

const Detail = ({ initialData }) => {
  const [activeTab, setActiveTab] = useState('transaction');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sectionsRef = useRef({});
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isEditPaymentMethodOpen, setIsEditPaymentMethodOpen] = useState(false);
  const [isEditTripMediaOpen, setIsEditTripMediaOpen] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Edit Payment Method Form Component
// Edit Payment Method Form Component
const EditPaymentMethodForm = ({ onClose }) => {
  const { data, setData, post, processing, errors } = useForm({
    payment_method: initialData.financial_data.paymentMethod ? initialData.financial_data.paymentMethod.toLowerCase() : '',
    generate_xendit_link: false
  });
  

  // Payment method options
  const paymentMethods = [
    {
      value : 'cash', label : 'CASH',
    },
    {
      value : 'cc', label : 'Credit/Debit Card',
    },
    {
      value : 'wise', label : 'WISE',
    },
    {
      value : 'edc', label : 'EDC',
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/bookings/payment-method/'+initialData.booking_information.id, {
      onSuccess: () => {
        onClose();
        Toast.fire({
            icon: 'success',
            title: 'Payment method updated successfully'
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold">Edit Payment Method</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="edit_payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                id="edit_payment_method"
                value={data.payment_method}
                onChange={e => setData('payment_method', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              {errors.payment_method && (
                <div className="text-red-500 text-sm mt-1">{errors.payment_method}</div>
              )}
            </div>
            
            {/* Xendit Payment Link Toggle - Only shown when cc is selected */}
            {data.payment_method === 'cc' && (
              <div className="flex items-center justify-between mt-4">
                <label htmlFor="generate_xendit_link" className="text-sm font-medium text-gray-700">
                  Generate Xendit Payment Link
                </label>
                <div 
                  className="relative inline-block w-12 h-6 cursor-pointer"
                  onClick={() => setData('generate_xendit_link', !data.generate_xendit_link)}
                >
                  <div className={`w-full h-full rounded-full transition-colors duration-200 ease-in ${data.generate_xendit_link ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <div 
                    className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform duration-200 ease-in transform ${data.generate_xendit_link ? 'translate-x-6' : 'translate-x-0'}`}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-75"
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
  // Payment Form Component
  const PaymentForm = ({ onClose }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
      nominal: (initialData.financial_data.balance-initialData.financial_data.add_on_only).toString(),
      payment_method: '',
      reference: '',
      note: '',
      send_receipt: true,
      invoice_item: 'package' // Default to package
    });
    
    const [nominalExceedsBalance, setNominalExceedsBalance] = useState(false);
    const hasAddOn = initialData.financial_data.add_on_only > 0;
    const showInvoiceItemSelect = initialData.financial_data.balance !== 0 && hasAddOn;
  
    // Set nominal and note when invoice_item changes
    useEffect(() => {
      if (showInvoiceItemSelect && data.invoice_item === 'add_on') {
        setData({
          ...data,
          nominal: initialData.financial_data.add_on_only.toString(),
          note: 'Payment Add On'
        });
      } else if (showInvoiceItemSelect && data.invoice_item === 'package' && data.nominal) {
        // If switching back to package, verify the amount is valid
        validateNominal(data.nominal);
        setData({
          ...data,
          nominal: (initialData.financial_data.balance-initialData.financial_data.add_on_only).toString(),
          note: ''
        });
      }
    }, [data.invoice_item]);
  
    // Validate nominal amount against max allowed
    const validateNominal = (value) => {
      const numericValue = value.toString().replace(/\D/g, '');
      const balance = initialData.financial_data.balance || 0;
      const addOnAmount = initialData.financial_data.add_on_only || 0;
      
      // Determine max amount based on invoice item
      let maxAmount = balance;
      if (showInvoiceItemSelect && data.invoice_item === 'package') {
        maxAmount = balance - addOnAmount;
      }
      
      setNominalExceedsBalance(parseInt(numericValue) > maxAmount);
      return numericValue;
    };
  
    // Extract only numbers from the input and validate
    const handleNominalChange = (e) => {
      // Don't allow changes if add_on is selected
      if (showInvoiceItemSelect && data.invoice_item === 'add_on') {
        return;
      }
      
      const numericValue = validateNominal(e.target.value);
      setData('nominal', numericValue);
    };
  
    // Format value to show in the input field
    const formattedNominal = () => {
      if (!data.nominal) return '';
      return formatCurrency(data.nominal);
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (nominalExceedsBalance) {
        return;
      }
      
      post('/bookings/payment/'+initialData.booking_information.id, {
        onSuccess: () => {
          reset();
          onClose();
          Toast.fire({
            icon: 'success',
            title: 'Payment added successfully'
          });
        }
      });
    };
  
    // Payment method options
    const paymentMethods = initialData.payment_method;
  
    // Get error message based on the current state
    const getNominalErrorMessage = () => {
      if (!nominalExceedsBalance) return null;
      
      const balance = initialData.financial_data.balance || 0;
      const addOnAmount = initialData.financial_data.add_on_only || 0;
      
      if (showInvoiceItemSelect && data.invoice_item === 'package') {
        return `Payment amount cannot exceed the package balance of ${formatCurrency(balance - addOnAmount)}`;
      } else {
        return `Payment amount cannot exceed the balance of ${formatCurrency(balance)}`;
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold">Add New Payment</h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="p-4 space-y-4">
              {/* Invoice Item Select (Conditional) */}
              {showInvoiceItemSelect && (
                <div>
                  <label htmlFor="invoice_item" className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Item
                  </label>
                  <select
                    id="invoice_item"
                    value={data.invoice_item}
                    onChange={e => setData('invoice_item', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="package">Package</option>
                    <option value="add_on">Add On</option>
                  </select>
                  {errors.invoice_item && (
                    <div className="text-red-500 text-sm mt-1">{errors.invoice_item}</div>
                  )}
                </div>
              )}
              
              {/* Nominal Input */}
              <div>
                <label htmlFor="nominal" className="block text-sm font-medium text-gray-700 mb-1">
                  Nominal
                </label>
                <input
                  id="nominal"
                  type="text"
                  value={formattedNominal()}
                  onChange={handleNominalChange}
                  className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    showInvoiceItemSelect && data.invoice_item === 'add_on' ? 'bg-gray-100' : ''
                  }`}
                  placeholder="Rp 0" 
                  required
                  readOnly={showInvoiceItemSelect && data.invoice_item === 'add_on'}
                />
                {errors.nominal && (
                  <div className="text-red-500 text-sm mt-1">{errors.nominal}</div>
                )}
                {getNominalErrorMessage() && (
                  <div className="text-red-500 text-sm mt-1">{getNominalErrorMessage()}</div>
                )}
                {showInvoiceItemSelect && data.invoice_item === 'add_on' && (
                  <div className="text-gray-500 text-sm mt-1">Amount is fixed for Add On payments</div>
                )}
              </div>
              
              {/* Payment Method Select */}
              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  id="payment_method"
                  value={data.payment_method}
                  onChange={e => setData('payment_method', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                {errors.payment_method && (
                  <div className="text-red-500 text-sm mt-1">{errors.payment_method}</div>
                )}
              </div>
              
              {/* Reference Input */}
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                  Reference
                </label>
                <input
                  id="reference"
                  type="text"
                  value={data.reference}
                  onChange={e => setData('reference', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Reference number, transaction ID, etc."
                />
                {errors.reference && (
                  <div className="text-red-500 text-sm mt-1">{errors.reference}</div>
                )}
              </div>
              
              {/* Note Input */}
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  id="note"
                  value={data.note}
                  onChange={e => setData('note', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes about this payment"
                  rows="3"
                  required
                ></textarea>
                {errors.note && (
                  <div className="text-red-500 text-sm mt-1">{errors.note}</div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="send_receipt" className="text-sm font-medium text-gray-700">
                  Send Receipt
                </label>
                <div 
                  className="relative inline-block w-12 h-6 cursor-pointer"
                  onClick={() => setData('send_receipt', !data.send_receipt)}
                >
                  <div className={`w-full h-full rounded-full transition-colors duration-200 ease-in ${data.send_receipt ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <div 
                    className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform duration-200 ease-in transform ${data.send_receipt ? 'translate-x-6' : 'translate-x-0'}`}
                  ></div>
                </div>              
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-75"
              >
                {processing ? 'Submitting...' : 'Save Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Trip Media Form Component
const EditTripMediaForm = ({ onClose }) => {
  const { data, setData, post, processing, errors } = useForm({
    media_link: initialData.client_information.media_link || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/bookings/trip-media/'+initialData.booking_information.id, {
      onSuccess: () => {
        onClose();
        Toast.fire({
          icon: 'success',
          title: 'Trip Media link updated successfully'
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold">Edit Trip Media</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="edit_media_link" className="block text-sm font-medium text-gray-700 mb-1">
                Trip Media Link
              </label>
              <input
                id="edit_media_link"
                type="url"
                value={data.media_link}
                onChange={e => setData('media_link', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/"
                required
              />
              {errors.media_link && (
                <div className="text-red-500 text-sm mt-1">{errors.media_link}</div>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-75"
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

  const tabs = [
    { id: 'transaction', label: 'Client Information' },
    { id: 'booking', label: 'Booking Information' },
    { id: 'itinerary', label: 'Package Details' },
    { id: 'activities', label: 'Activities' },
    { id: 'accommodation', label: 'Accommodation' },
    { id: 'resource', label: 'Resource Allocation' },
    { id: 'financial', label: 'Financial Data' }
  ];

  if (parseInt(initialData.booking_information.number_of_participants) >= 18) {
    tabs.splice(1, 0, { id: 'biggroup', label: 'Big Group' });
  }  

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
    <div className="flex gap-3 items-start py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
      <div className="w-1/3 text-sm text-gray-600">{label}</div>
      <div className="w-2/3 text-sm flex items-center">
        <span className="text-gray-900">{value || '-'}</span>
        {copyable && value !== '-' && <CopyButton text={value} id={`${label}-${value}`} />}
      </div>
    </div>
  );

  const Tooltip = ({ children, content }) => {
    const [isVisible, setIsVisible] = useState(false);
  
    return (
      <div 
        className="relative inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        {isVisible && (
          <div className="absolute z-50 w-64 p-3 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-2 left-full ml-2">
            <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-gray-900 border-b-[6px] border-b-transparent"></div>
            {content}
          </div>
        )}
      </div>
    );
  };  

  return (
    <Main>
      {isPaymentFormOpen && <PaymentForm onClose={() => setIsPaymentFormOpen(false)} />}
      {isEditPaymentMethodOpen && <EditPaymentMethodForm onClose={() => setIsEditPaymentMethodOpen(false)} />}
      {isEditTripMediaOpen && <EditTripMediaForm onClose={() => setIsEditTripMediaOpen(false)} />}
      
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
          {initialData.booking_information.is_buy_isic == '1' && initialData.booking_information.is_buy_isic_complete_form == '0' && (
            <div className="py-3 my-3 px-4 border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white rounded-r-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-30"></div>
                    <div className="relative bg-gradient-to-r from-green-500 to-blue-400 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center">
                      <span className="text-sm">!</span>
                    </div>
                  </div>
                </div>
                <div className="flex align-center justify-between w-full">
                  <div>
                    <h3 className="font-bold text-green-700">Need ISIC Verification</h3>
                    <p className="text-sm text-gray-600">This booking has {initialData.booking_information.number_of_participants} participants, which order ISIC Card.</p>
                  </div>
                  <div>
                    <button onClick={() => {
                      window.open('https://crm.isic.co.id/std/issuing/login.php', '_blank');
                    }} className="px-3 py-2 bg-gradient-to-r from-green-500 to-blue-400 text-white rounded-md text-sm flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      View ISIC Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {parseInt(initialData.booking_information.number_of_participants) >= 18 && (
            <div className="py-3 my-3 px-4 border-l-4 border-pink-500 bg-gradient-to-r from-pink-50 to-white rounded-r-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-30"></div>
                    <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center">
                      <span className="text-sm">!</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-pink-700">Big Group Participants</h3>
                  <p className="text-sm text-gray-600">This booking has {initialData.booking_information.number_of_participants} participants, which qualifies as a big group.</p>
                </div>
              </div>
              <div className="mt-2 pl-11">
                <ul className="text-sm space-y-1 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>May require additional resources</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>Consider assigning more staff</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span>Check vehicle capacity requirements</span>
                  </li>
                </ul>
              </div>
            </div>
          )}          
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
              <div className="flex gap-3 items-start py-3 border-b border-gray-200">
                <div className="w-1/3 text-sm text-gray-600">CLIENT NAME</div>
                <div className="w-2/3 text-sm flex items-center">
                  <a
                    href={`/client-management/details/${initialData.client_information.client_id}`}                    
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-700 hover:underline transition-colors duration-200"
                  >
                    {initialData.client_information.client_name}
                  </a>
                </div>
              </div>
              {initialData.booking_information.order_channel !== 'TWT' && (
                <>
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
                  {initialData.order_channel !== 'TWT' && (
                    <>
                      <div className="flex gap-3 items-start py-3 border-b border-gray-200">
                        <div className="w-1/3 text-sm text-gray-600">Trip Media</div>
                        <div className="w-2/3 text-sm flex items-center gap-3">
                          {initialData.client_information.media_link ? (
                            <a
                              href={initialData.client_information.media_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-700 hover:underline transition-colors duration-200"
                            >
                              {initialData.client_information.media_link}
                            </a>
                          ) : '-'}
                          <button 
                            onClick={() => setIsEditTripMediaOpen(true)} 
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4 text-blue-600"/>
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start py-3 border-b border-gray-200">
                        <div className="w-1/3 text-sm text-gray-600">Client Portal</div>
                        <div className="w-2/3 text-sm flex items-center">
                          <a
                            href={initialData.client_information.portal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-700 hover:underline transition-colors duration-200 w-full break-words"
                          >
                            {initialData.client_information.portal}
                          </a>
                        </div>
                      </div>
                      
                    </>
                  )}

                </>
              )}
            </div>
          </div>

{/* Add this entire section between the Package Details and Activities sections */}
{parseInt(initialData.booking_information.number_of_participants) >= 18 && (
  <div
    ref={el => sectionsRef.current['biggroup'] = el}
    className="bg-white rounded-lg shadow-sm mb-6 transition-all duration-200 hover:shadow-md"
  >
    <div className="p-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
          <div className="mr-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center">
            <span className="text-sm text-white">
              <Users size={20} />
            </span>
          </div>
          Big Group Participants
        </h2>
        <div>
            <button onClick={() => {
              window.open('https://travelhub.javavolcano-touroperator.com/dashboard/'+initialData.booking_information.url, '_blank');
            }} className="px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md text-sm flex items-center gap-1">
              <Eye className="h-4 w-4" />
              View Travel Hub
            </button>
        </div>
      </div>
      
      {/* Participants list section */}
      <div className="mb-8">        
        <div className="overflow-x-auto h-[500px] overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T-Shirt Size</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dietary Restriction</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car/Seat</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialData.client_information.participants && initialData.client_information.participants.map((participant, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-medium text-sm mr-3">
                        {participant.title ? participant.title.charAt(0) : (participant.gender === 'Male' ? 'M' : 'F')}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{participant.title} {participant.full_name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.gender || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {participant.tshirt_size ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {participant.tshirt_size}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.dietary_restriction || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {participant.car_number ? `Car ${participant.car_number}` : ''} 
                    {participant.car_number && participant.seat_number ? ' / ' : ''}
                    {participant.seat_number ? `Seat ${participant.seat_number}` : ''}
                    {!participant.car_number && !participant.seat_number ? '-' : ''}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{participant.room_number || '-'}</td>
                </tr>
              ))}
              
              {(!initialData.client_information.participants || initialData.client_information.participants.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                    No participant details available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
)}
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
              <div className="flex gap-3 items-start py-3 border-b border-gray-200">
                <div className="w-1/3 text-sm text-gray-600">TOUR PACKAGE</div>
                <div className="w-2/3 text-sm flex items-center">
                {initialData.booking_information.order_channel != 'TWT' ? (
                    <a
                      href={`/package-inventory/edit/`+initialData.booking_information.package_id}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-700 hover:underline transition-colors duration-200"
                    >
                      {initialData.booking_information.tour_package}
                    </a>
                ) : (
                  <span className="text-gray-900">{initialData.booking_information.tour_package}</span>
                )}
                </div>
              </div>
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
          {initialData.package_information.length != 0 && (
          <div
            ref={el => sectionsRef.current['itinerary'] = el}
            className="bg-white rounded-lg shadow-sm mb-6 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Package Details</h2>
              {initialData.booking_information.order_channel != 'TWT' ? (
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
          )}

          <div
            ref={el => sectionsRef.current['activities'] = el}
            className="bg-white rounded-lg shadow-sm mb-6 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Activities</h2>
                <div className="space-y-4">
                {initialData.itinerary_information.filter((i) => i.activity && i.activity != 'Surabaya').map((day, index) => (
                  <>
                  <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <h3 className="font-medium mb-1">Day {day.day} - {day.date}</h3>
                    <div className="text-sm text-gray-600">
                      {day.activity}
                      {day.activity && day.other_booking && day.other_booking.length > 0 && (
                        <Tooltip
                          content={
                            <div className="space-y-2">
                              {day.other_booking.map((booking, idx) => (
                                <div key={idx} className="border-b border-gray-700 last:border-0 pb-2 last:pb-0">
                                  <div className="font-medium">{booking.booking.user.name}</div>
                                  <div>Total Pax: {booking.booking.total_pax}</div>
                                  {booking.booking.book_hotel.length > 0 && (
                                    <div>Hotel: {booking.booking.book_hotel[0].hotel.name}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          }
                        >
                          <span className="ml-2 inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {day.other_booking.length} same {day.other_booking.length === 1 ? 'activity' : 'activities'}
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  {day.activity_start_id == 7 && (
                    <div key={`mada-`+index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <h3 className="font-medium mb-1">Day {day.day} - {day.date}</h3>
                    <div className="text-sm text-gray-600">
                      Madakaripura Waterfall Tour
                    </div>
                  </div>
                  )}
                  {day.activity_end_id == 5 && (
                    <div key={`papuma-`+index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <h3 className="font-medium mb-1">Day {day.day} - {day.date}</h3>
                    <div className="text-sm text-gray-600">
                      Papuma Beach Sunset Tour
                    </div>
                  </div>
                  )}
                  </>
                ))}                
              </div>
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
                    <h3 className="font-medium mb-2 underline text-blue-600">
                      <Link href={`/vendor/accommodation/${acc.hotel_id}?bookingId=${initialData.booking_information.id}&tab=schedule`}>
                      Day {acc.day} - {acc.hotel}
                      </Link>
                      </h3>
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
              <div className="flex gap-3 items-start py-3 border-b border-gray-200">
                <div className="w-1/3 text-sm text-gray-600">TOTAL INVOICE</div>
                <div className="w-2/3 text-sm flex items-center">
                  {initialData.financial_data.invoice.invoiceLink.length ? (
                      <div 
                        onClick={() => {
                          initialData.financial_data.invoice.invoiceLink.forEach(link => 
                            window.open(link, '_blank')
                          );
                        }}
                        className="text-blue-600 cursor-pointer underline hover:text-blue-700 hover:underline transition-colors duration-200"
                          >
                        {formatCurrency(initialData.financial_data.invoice.total)}
                      </div>
                    ) : (
                      <div className="text-blue-500">
                        {formatCurrency(initialData.financial_data.invoice.total)}
                      </div>
                    )}

                </div>
              </div>
              {initialData.booking_information.order_channel !== 'TWT' && (
                <>
                  <DetailRow
                    label="TOTAL PAYMENT"
                    value={formatCurrency(initialData.financial_data.payment)}
                  />
                  {initialData.booking_information.order_channel === 'JVTO' && (
                    <>
                      <DetailRow
                        label="BALANCE"
                        value={`${formatCurrency(initialData.financial_data.balance)}`}
                      />
                    <div className="flex gap-3 items-start py-3 border-b border-gray-200">
                      <div className="w-1/3 text-sm text-gray-600">PAYMENT METHOD</div>
                      <div className="w-2/3 text-black text-sm flex items-center gap-3">
                          {initialData.financial_data.paymentMethod ?? '-'}
                          {
                            initialData.financial_data.balance > 0 && (
                              <button 
                                onClick={() => setIsEditPaymentMethodOpen(true)} 
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <Pencil className="h-4 w-4 text-blue-600"/>
                              </button>
                            ) 
                          }
                      </div>
                    </div>
                    {initialData.financial_data.outstanding_payment_link && (
                      <div className="flex gap-3 items-start py-3 border-b border-gray-200">
                        <div className="w-1/3 text-sm text-gray-600">OUTSTADING PAYMENT LINK</div>
                        <div className="w-2/3 text-black text-sm flex items-center gap-3">
                            <a 
                              href={initialData.financial_data.outstanding_payment_link}
                              target="_blank" 
                              className="text-blue-600 hover:text-blue-800 underline"
                              >
                              {initialData.financial_data.outstanding_payment_link}
                            </a>
                        </div>
                      </div>
                    )}
                    </>
                  )}
                </>
              )}
              <div className="flex gap-3 items-start py-3 border-b border-gray-200">
                <div className="w-1/3 text-sm text-gray-600">EXPENSE</div>
                <div className="w-2/3 text-sm flex items-center">
                  <a
                    href={initialData.financial_data.expense.expenseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-700 hover:underline transition-colors duration-200"
                  >
                    {formatCurrency(initialData.financial_data.expense.total)}
                  </a>
                </div>
              </div>
              <DetailRow
                label="PROFIT"
                value={formatCurrency(initialData.financial_data.profit)}
              />
              {initialData.booking_information.order_channel === 'JVTO' && initialData.financial_data.balance != 0 && (
                <div className="mt-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Payment History</h3>
                  <div>
                    <button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md flex items-center justify-center transition-colors"
                      onClick={() => setIsPaymentFormOpen(true)}
                    >
                      + Add Payment
                    </button>
                  </div>
                </div>
              )}
              {/* Payment History */}
              {initialData.financial_data.payment_history.length > 0 && (
                <>
                  <div className="mt-3 space-y-4">
                    {initialData.financial_data.payment_history.map((payment, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">{payment.description}</span>
                          <span className="font-semibold">{formatCurrency(payment.nominal)}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><span className="mr-2">Payment Method:</span> 
                            {payment.reference ? (
                                <a
                                  href={payment.reference}
                                  className="text-blue-600 underline hover:text-blue-700 hover:underline transition-colors duration-200"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {payment.paymentMethod}
                                </a>
                            ): payment.paymentMethod}
                          </div>
                          <div>Date: {payment.date}</div>
                          <div>Receipt No: {initialData.booking_information.booking_reference_id.replace('JVR','RCP')}/{index+1}</div>                               
                          <div className="flex gap-2">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-3">
                                <a
                                  href={payment.receipt}
                                  className="text-blue-600 flex items-center gap-0.5 text-sm underline hover:text-blue-700 hover:underline transition-colors duration-200"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Eye className="h-4 w-4"/> View
                                </a>
                                <a
                                  href={`${payment.receipt}?download=true`}
                                  className="text-blue-600 flex items-center gap-0.5 text-sm underline hover:text-blue-700 hover:underline transition-colors duration-200"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4"/> Download
                                </a>
                              </div>
                            </div>
                          </div>
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
    </Main>
  );
};

export default Detail;