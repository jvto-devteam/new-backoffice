import React, { useState, useEffect } from 'react';
import { Head,router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import axios from 'axios';
import { 
    Calendar, 
    MessageSquare, 
    ChevronLeft, 
    ChevronDown, 
    ChevronRight, 
    Search, 
    X,
    Filter,
    Clock,
    RefreshCw
} from 'lucide-react';

export default function DailyChatSummary({ summaries, selectedDate, selectedDateFormatted, yesterday, tomorrow, categories }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [filteredSummaries, setFilteredSummaries] = useState(summaries);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatDetails, setChatDetails] = useState({});
    const [loading, setLoading] = useState({});
    const [showChatMap, setShowChatMap] = useState({});
    const toggleChatHistory = (userId) => {
        setShowChatMap(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
        
        // Load chat data jika belum dimuat
        if (!chatDetails[userId]) {
            viewChatDetails(userId);
        }
    };
    

    // Apply filters when searchTerm or categoryFilter changes
    useEffect(() => {
        let filtered = summaries;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(summary => 
                summary.user_name.toLowerCase().includes(term) || 
                summary.user_phone.toLowerCase().includes(term) || 
                summary.summary.toLowerCase().includes(term)
            );
        }
        
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(summary => 
                summary.category_id.toString() === categoryFilter
            );
        }
        
        setFilteredSummaries(filtered);
    }, [searchTerm, categoryFilter, summaries]);

    // Change date handler
    const changeDate = (date) => {
        router.get(route('daily-chat-summary'), { date }, {
            preserveState: true,
            replace: true,
        });
    };

    // View chat details handler
    const viewChatDetails = async (userId) => {
        if (chatDetails[userId]) {
            return; // Already loaded
        }
        
        setLoading(prev => ({ ...prev, [userId]: true }));
        
        try {
            const response = await axios.get(route('daily-chat-summary.view-chats', {
                userId: userId,
                date: selectedDate
            }));
            
            setChatDetails(prev => ({
                ...prev,
                [userId]: response.data
            }));
        } catch (error) {
            console.error('Error fetching chat details:', error);
        } finally {
            setLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    // Toggle selection of a chat card
    const toggleCard = (userId) => {
        if (selectedChat === userId) {
            setSelectedChat(null);
        } else {
            setSelectedChat(userId);
            if (!chatDetails[userId]) {
                viewChatDetails(userId);
            }
        }
    };

    return (
        <Main>
            <Head title="Daily Chat Summary" />
            
            <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">Daily Chat Summary</h1>
                    
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center bg-white shadow-sm rounded-md px-3 py-2">
                            <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-sm font-medium text-gray-700 mr-2">
                                {selectedDateFormatted}
                            </span>
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => changeDate(e.target.value)}
                                className="text-sm text-gray-700 focus:outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, phone, or content..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        {searchTerm && (
                            <button
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setSearchTerm('')}
                            >
                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="block w-full sm:w-48 pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button 
                        onClick={() => router.reload({ only: ['summaries'] })}
                        className="flex items-center justify-center px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
                
                {/* No results message */}
                {filteredSummaries.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-700 mb-1">No chat summaries found</h3>
                        <p className="text-gray-500 text-sm">
                            {searchTerm || categoryFilter !== 'all' 
                                ? 'Try adjusting your search filters.' 
                                : 'No chat summaries available for this date.'}
                        </p>
                    </div>
                )}
                
                {/* 3-Column Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredSummaries.map(summary => (
                        <div 
                            key={summary.id} 
                            className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-all duration-200 ${
                                selectedChat === summary.user_id ? 'ring-2 ring-blue-500 transform scale-[1.02]' : 'hover:shadow-md'
                            }`}
                        >
{/* Card Header */}
<div 
    className="p-4 cursor-pointer"
    onClick={() => toggleCard(summary.user_id)}
>
    <div className="flex items-start justify-between">
        <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-gray-700 font-medium">
                    {summary.user_name.charAt(0).toUpperCase()}
                </span>
            </div>
            <div>
                <h3 className="font-medium text-gray-800">{summary.user_name}</h3>
                <p className="text-xs text-gray-500">{summary.user_phone}</p>
            </div>
        </div>
        <div>
            <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                style={{ 
                    backgroundColor: `${summary.category_color}20`, 
                    color: summary.category_color 
                }}
            >
                {summary.category_name}
            </span>
        </div>
    </div>
    
    {/* Summary Preview - always visible but clipped when not selected */}
    <div className="mt-3">
        <h4 className="text-xs font-medium text-gray-500 uppercase flex items-center">
            <MessageSquare className="w-3 h-3 mr-1" />
            Summary Notes
        </h4>
        <div className={`mt-1 text-sm text-gray-600 whitespace-pre-line ${selectedChat !== summary.user_id ? 'line-clamp-3' : ''}`}>
            {summary.summary}
        </div>
    </div>
    
    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
            <MessageSquare className="w-3 h-3 mr-1" />
            <span>{summary.chat_count} messages</span>
        </div>
        <button
            onClick={(e) => {
                e.stopPropagation();
                toggleCard(summary.user_id);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
            {selectedChat === summary.user_id ? 'Hide Details' : 'View Details'}
        </button>
    </div>
</div>

{/* Expanded Details */}
{selectedChat === summary.user_id && (
    <div className="border-t border-gray-100 p-4 bg-gray-50">
        {/* Toggle for showing chat history */}
        <div className="mb-4">
    <button 
        onClick={(e) => {
            e.stopPropagation();
            toggleChatHistory(summary.user_id);
        }}
        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
    >
        {showChatMap[summary.user_id] ? (
            <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Hide Chat History
            </>
        ) : (
            <>
                <ChevronRight className="w-4 h-4 mr-1" />
                Show Chat History ({summary.chat_count} messages)
            </>
        )}
    </button>
</div>        
        {/* Chat Messages - Shown only when toggled */}
        {showChatMap[summary.user_id] && (
            <>
                <h4 className="text-xs font-medium text-gray-500 uppercase flex items-center mb-2">
                    <Clock className="w-3 h-3 mr-1" />
                    Chat Messages
                </h4>
                
                {loading[summary.user_id] ? (
                    <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                ) : chatDetails[summary.user_id] ? (
                    chatDetails[summary.user_id].chats.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No messages found</p>
                    ) : (
                        <div className="bg-white rounded border border-gray-200 p-3 max-h-72 overflow-y-auto">
                            {chatDetails[summary.user_id].chats.map((chat, index) => (
                                <div 
                                    key={index} 
                                    className={`mb-2 flex ${chat.is_from_me ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`
                                            max-w-xs px-3 py-2 rounded-lg text-sm
                                            ${chat.is_from_me 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-white border border-gray-200 text-gray-800'
                                            }
                                        `}
                                    >
                                        <p>{chat.message}</p>
                                        <span className={`text-xs ${chat.is_from_me ? 'text-blue-100' : 'text-gray-500'} block text-right mt-1`}>
                                            {chat.created_at}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-4">
                        <button 
                            onClick={() => viewChatDetails(summary.user_id)} 
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100"
                        >
                            Load Messages
                        </button>
                    </div>
                )}
            </>
        )}
    </div>
)}
                        </div>
                    ))}
                </div>
            </div>
        </Main>
    );
}