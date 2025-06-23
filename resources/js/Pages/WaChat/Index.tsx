import React, { useState, useEffect, useRef } from 'react';
import Main from '@/Layouts/Main';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Head } from '@inertiajs/react';

export default function WaChat({ summaries = [] }) {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const chatContainerRef = useRef(null);
  
  // Filter summaries based on search term
  const filteredSummaries = summaries
  // .filter(chat => 
  //   chat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
  //   chat.phone.includes(searchTerm)
  // );

  // Fetch chat details - this is the only function that uses API
  const fetchChatDetails = async (userId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/wa-chat/${userId}`);
      setChats(response.data.chats);
      setSelectedUser(response.data.user);
    } catch (error) {
      console.error('Error fetching chat details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = (userId) => {
    fetchChatDetails(userId);
    setIsMobileSidebarOpen(false);
  };

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    // Optimistically add the message to the UI
    const newMessage = {
      id: Date.now(), // Temporary ID
      message: message,
      is_from_me: true,
      created_at: new Date().toISOString(),
      has_media: false,
      media_mime: null
    };
    
    setChats(prevChats => [...prevChats, newMessage]);
    setMessage('');

    try {
      // Send the message to the server
      await axios.post(`/api/wa-chat/send`, {
        user_id: selectedUser.id,
        message: message
      });
      
      // Refresh chat details to get the updated message list with server IDs
      fetchChatDetails(selectedUser.id);
    } catch (error) {
      console.error('Error sending message:', error);
      // If there's an error, you might want to show a notification
    }
  };

  // Scroll to bottom when chats change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  // Format functions
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

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm');
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hari ini';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    } else {
      return format(date, 'EEEE, dd MMMM yyyy', { locale: id });
    }
  };

  const truncateMessage = (message, length = 35) => {
    if (message.length <= length) return message;
    return message.substring(0, length) + '...';
  };

  // Group chats by date
  const groupedChats = chats.reduce((groups, chat) => {
    const date = formatMessageDate(chat.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(chat);
    return groups;
  }, {});

  // Toggle attachment menu
  const toggleAttachmentMenu = () => {
    setIsAttachmentMenuOpen(!isAttachmentMenuOpen);
  };

  return (
    <Main>
      <Head title="WhatsApp Chat" />
      
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Mobile Header - shown only on small screens */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between md:hidden">
          <h1 className="text-xl font-bold">WhatsApp Chat</h1>
          <button 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1"
          >
            {isMobileSidebarOpen ? (
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
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            ) : (
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
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            )}
          </button>
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar - Chat List */}
          <div 
            className={`
              ${isMobileSidebarOpen ? 'block' : 'hidden'} 
              md:block w-full md:w-96 lg:w-1/3 xl:w-1/4 
              bg-white border-r border-gray-200 flex flex-col
            `}
          >
            {/* Search Bar */}
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama atau nomor..."
                  className="w-full p-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
            
            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {filteredSummaries.length > 0 ? (
                filteredSummaries.map((chat) => (
                  <div 
                    key={chat.user_id}
                    onClick={() => handleChatSelect(chat.user_id)}
                    className={`
                      border-b border-gray-200 hover:bg-gray-50 transition duration-150 cursor-pointer
                      ${selectedUser && selectedUser.id === chat.user_id ? 'bg-emerald-50' : ''}
                    `}
                  >
                    <div className="flex items-center p-3">
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
                  </div>
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
            
            {/* New Chat Button */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <button className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center justify-center transition duration-150">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
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
                Chat Baru
              </button>
            </div>
          </div>
          
          {/* Main Chat Area */}
          <div className={`flex-1 flex flex-col ${!selectedUser && 'items-center justify-center'}`}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="bg-emerald-600 text-white flex items-center p-3 shadow-sm">
                  <div className="md:hidden mr-2">
                    <button onClick={() => setIsMobileSidebarOpen(true)}>
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
                          d="M15 19l-7-7 7-7" 
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mr-3">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">{selectedUser.name}</h2>
                      <p className="text-xs text-emerald-100">{selectedUser.phone}</p>
                    </div>
                  </div>
                  <div className="flex">
                    <button className="p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </button>
                    <button className="p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 bg-[#e5ded8]"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23bbb' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    backgroundSize: '300px'
                  }}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                      <p className="mt-3 text-gray-600">Memuat percakapan...</p>
                    </div>
                  ) : (
                    Object.entries(groupedChats).map(([date, dateChats]) => (
                      <div key={date} className="mb-4">
                        <div className="flex justify-center mb-3">
                          <span className="bg-gray-200 text-gray-600 text-xs py-1 px-3 rounded-full">
                            {date}
                          </span>
                        </div>
                        
                        {dateChats.map((chat) => (
                          <div 
                            key={chat.id} 
                            className={`flex mb-3 ${chat.is_from_me ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`rounded-lg px-4 py-2 max-w-xs md:max-w-sm lg:max-w-md shadow relative ${
                                chat.is_from_me 
                                  ? 'bg-emerald-100 text-gray-800' 
                                  : 'bg-white text-gray-800'
                              }`}
                            >
                              {chat.has_media && (
                                <div className="mb-2 rounded overflow-hidden">
                                  {chat.media_mime && chat.media_mime.startsWith('image') ? (
                                    <div className="bg-gray-200 h-48 w-full flex items-center justify-center">
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-12 w-12 text-gray-400" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                      >
                                        <path 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                          strokeWidth={2} 
                                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                        />
                                      </svg>
                                    </div>
                                  ) : chat.media_mime && chat.media_mime.startsWith('video') ? (
                                    <div className="bg-gray-200 h-48 w-full flex items-center justify-center">
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-12 w-12 text-gray-400" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                      >
                                        <path 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                          strokeWidth={2} 
                                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                                        />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="bg-gray-200 p-4 flex items-center justify-center">
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-8 w-8 text-gray-400" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                      >
                                        <path 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                          strokeWidth={2} 
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                        />
                                      </svg>
                                      <span className="ml-2 text-sm">Document</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <p className="whitespace-pre-wrap break-words">{chat.message}</p>
                              <div className="text-right mt-1">
                                <span className="text-xs text-gray-500">
                                  {formatMessageTime(chat.created_at)}
                                  {chat.is_from_me && (
                                    <span className="ml-1">
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-3 w-3 inline text-blue-500" 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor"
                                      >
                                        <path 
                                          fillRule="evenodd" 
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                          clipRule="evenodd" 
                                        />
                                      </svg>
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
                
                {/* Message Input */}
                <div className="bg-white p-3 border-t border-gray-200">
                  {isAttachmentMenuOpen && (
                    <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg mb-2">
                      <button className="flex flex-col items-center justify-center p-2 bg-purple-100 rounded-lg">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6 text-purple-600" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                          />
                        </svg>
                        <span className="text-xs mt-1">Foto</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-2 bg-blue-100 rounded-lg">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6 text-blue-600" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                          />
                        </svg>
                        <span className="text-xs mt-1">Video</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-2 bg-green-100 rounded-lg">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6 text-green-600" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                          />
                        </svg>
                        <span className="text-xs mt-1">Dokumen</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-2 bg-yellow-100 rounded-lg">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6 text-yellow-600" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                          />
                        </svg>
                        <span className="text-xs mt-1">Lokasi</span>
                      </button>
                    </div>
                  )}
                  
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <button 
                      type="button" 
                      className="p-2 text-gray-500 hover:text-gray-700"
                      onClick={toggleAttachmentMenu}
                    >
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
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
                        />
                      </svg>
                    </button>
                    <div className="flex-1 mx-2">
                      <input
                        type="text"
                        placeholder="Ketik pesan..."
                        className="w-full p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="p-2 bg-emerald-600 rounded-full text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition duration-150"
                      disabled={!message.trim() || !selectedUser}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16 text-emerald-600" 
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
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">WhatsApp Chat</h2>
                <p className="text-gray-600 max-w-md mb-6">
                  Pilih chat dari daftar untuk memulai percakapan atau mulai chat baru dengan tombol di bawah
                </p>
                <button 
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center justify-center transition duration-150"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
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
                  Lihat Daftar Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Main>
  );
}                          