import Main from '@/Layouts/Main';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Index = (data) => {
  // Sample data structure
  const packages = data.data.packages;

  const [expandedSections, setExpandedSections] = useState(() => {
    // Initialize all sections to be open
    const initialState = {};
    Object.keys(packages).forEach(section => {
      initialState[section] = true;
    });
    return initialState;
  });


  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(price);
  };
  
  return (
    <Main>
      <div className="space-y-4">
        {Object.entries(packages).map(([section, items]) => (
          <div key={section} className="border rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection(section)}
              className="w-full px-4 py-3 flex justify-between items-center bg-white hover:bg-gray-50 rounded-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900">{section}</h3>
              {expandedSections[section] ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections[section] && (
              <div className="p-4 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 w-32">Package ID</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 w-64">Package Name</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 w-96">Destination</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900 w-32">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{item.id}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.itinerary.map((data,index) => (
                            <div className="inline" key={index}>
                              <span>{data.itinerary_destination.destination.name}, </span>
                              {data.itinerary_destination.second_destination_id ? (
                                <span>{data.itinerary_destination.second_destination.name}, </span>
                              ) : ''}
                            </div>
                          ))}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatPrice(item.min_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Main>
  );
};

export default Index;