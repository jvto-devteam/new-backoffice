import React, { useState } from 'react';
import Main from '@/Layouts/Main';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Index({ summaries }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter summaries based on search term
  const filteredSummaries = summaries.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    chat.phone.includes(searchTerm)
  );

  // Function to format date
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'dd MMM', { locale: id });
    }
  };

  // Function to truncate last message
  const truncateMessage = (message, length = 35) => {
    if (message.length <= length) return message;
    return message.substring(0, length) + '...';
  };

  return (
    <Main>
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="bg-emerald-600 text-white p-4 shadow-md">
          <h1 className="text-xl font-bold">Chat WhatsApp</h1>
          <div className="mt-2 relative">
            <input
              type="text"
              placeholder="Cari nama atau nomor..."
              className="w-full p-2 pl-10 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 absolute left-3 top-2.5 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {filteredSummaries.length > 0 ? (
            filteredSummaries.map((chat) => (
              <Link 
                href={`/wa-chat/${chat.user_id}`} 
                key={chat.user_id}
                className="block border-b border-gray-200 hover:bg-gray-50 transition duration-150"
              >
                <div className="flex items-center p-4">
                  <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                    <img 
                      src={chat.avatar} 
                      alt={chat.name} 
                      className="w-full h-full rounded-full object-cover border border-gray-200" 
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {chat.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(chat.sent_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 truncate">
                      {truncateMessage(chat.last_chat)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 mb-4 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
              <p className="text-center">
                {searchTerm ? 'Tidak ada chat yang cocok dengan pencarian Anda' : 'Tidak ada chat tersedia'}
              </p>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <button className="bg-emerald-600 hover:bg-emerald-700 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-colors duration-300">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
          </button>
        </div>
      </div>
    </Main>
  );
}