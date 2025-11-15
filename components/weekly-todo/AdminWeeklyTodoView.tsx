'use client';

import { useState, useEffect } from 'react';
import { WeeklyTodo, User } from '@/types/weekly-todo';
import { adminWeeklyTodoService } from '@/services/admin-weekly-todo';

interface GroupedTodos {
  [userId: string]: {
    user: User;
    todos: WeeklyTodo[];
  };
}

export default function AdminWeeklyTodoView() {
  const [groupedTodos, setGroupedTodos] = useState<GroupedTodos>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  
  // Filters
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'this-week' | 'last-week' | 'custom' | 'all'>('this-week');
  const [customDate, setCustomDate] = useState('');
  const [weekdayFilter, setWeekdayFilter] = useState<string>('all');

  // Get date range
  const getDateRange = () => {
    const now = new Date();
    let start: Date, end: Date;

    switch (dateRange) {
      case 'this-week':
        // Calculate Saturday as start of week (6 = Saturday)
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysUntilSaturday = currentDay === 6 ? 0 : (6 - currentDay + 7) % 7;
        start = new Date(now);
        start.setDate(now.getDate() - daysUntilSaturday); // This Saturday
        end = new Date(start);
        end.setDate(start.getDate() + 6); // Next Friday
        break;
      case 'last-week':
        // Calculate last Saturday
        const currentDayForLast = now.getDay();
        const daysSinceLastSaturday = (currentDayForLast - 6 + 7) % 7;
        start = new Date(now);
        start.setDate(now.getDate() - daysSinceLastSaturday - 7); // Last Saturday
        end = new Date(start);
        end.setDate(start.getDate() + 6); // Last Friday
        break;
      case 'custom':
        if (!customDate) return { start: null, end: null };
        return {
          start: customDate,
          end: customDate,
        };
      default:
        return { start: null, end: null };
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const dateRangeValues = getDateRange();
      const data = await adminWeeklyTodoService.getAdminTodos({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        userId: selectedUser !== 'all' ? selectedUser : undefined,
        weekday: weekdayFilter !== 'all' ? weekdayFilter : undefined,
        startDate: dateRangeValues.start || undefined,
        endDate: dateRangeValues.end || undefined,
      });

      // Extract unique users from todos
      const uniqueUsers = Array.from(
        new Map(
          data.todos
            .filter(todo => todo.user) // Filter out todos with undefined user
            .map(todo => [todo.user!.id, todo.user as User])
        ).values()
      );
      setUsers(uniqueUsers);

      // Group todos by user
      const grouped: GroupedTodos = {};
      data.todos.forEach(todo => {
        if (!todo.user) return; // Skip todos without user
        
        const userId = todo.user.id;
        if (!grouped[userId]) {
          grouped[userId] = {
            user: todo.user,
            todos: [],
          };
        }
        grouped[userId].todos.push(todo);
      });

      setGroupedTodos(grouped);
      
      // Auto-expand if only one user or specific user selected
      if (selectedUser !== 'all') {
        setExpandedUsers(new Set([selectedUser]));
      } else if (Object.keys(grouped).length === 1) {
        setExpandedUsers(new Set([Object.keys(grouped)[0]]));
      }
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedUser, statusFilter, dateRange, customDate, weekdayFilter]);

  const toggleUserAccordion = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedUsers(new Set(Object.keys(groupedTodos)));
  };

  const collapseAll = () => {
    setExpandedUsers(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getUserLocation = (user: User) => {
    const locationParts = [];
    if (user.division) locationParts.push(user.division);
    if (user.district) locationParts.push(user.district);
    if (user.upazila) locationParts.push(user.upazila);
    if (user.union) locationParts.push(user.union);
    return locationParts.join(' → ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-md md:text-3xl font-bold text-gray-900">সাপ্তাহিক প্ল্যান - অ্যাডমিন ভিউ</h1>
        <p className="text-xs md:text-sm text-gray-600 mt-2">সকল ইউজারের সাপ্তাহিক প্ল্যান দেখুন ও ম্যানেজ করুন</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ব্যবহারকারী
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">সকল ব্যবহারকারী</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              স্ট্যাটাস
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">সব স্ট্যাটাস</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              তারিখ
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="this-week">এই সপ্তাহ</option>
              <option value="last-week">গত সপ্তাহ</option>
              <option value="custom">কাস্টম</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end space-x-2">
            <button
              onClick={fetchData}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Custom Date */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                তারিখ
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Weekday Filter */}
        {dateRange !== 'custom' && dateRange !== 'all' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              দিন অনুযায়ী ফিল্টার
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setWeekdayFilter("all")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  weekdayFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                সপ্তাহের সব দিন
              </button>
              {[
                { name: "শনিবার", value: "saturday" },
                { name: "রবিবার", value: "sunday" },
                { name: "সোমবার", value: "monday" },
                { name: "মঙ্গলবার", value: "tuesday" },
                { name: "বুধবার", value: "wednesday" },
                { name: "বৃহস্পতিবার", value: "thursday" },
                { name: "শুক্রবার", value: "friday" }
              ].map((day) => (
                <button
                  key={day.value}
                  onClick={() => setWeekdayFilter(day.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    weekdayFilter === day.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {day.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Accordion Controls */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            মোট {Object.keys(groupedTodos).length} জন ব্যবহারকারী
          </div>
          <div className="flex space-x-2">
            <button
              onClick={expandAll}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              সব খুলুন
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              সব বন্ধ করুন
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* User Accordions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedTodos).map(([userId, { user, todos }]) => (
          <div key={userId} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full flex flex-col">
            {/* User Header */}
            <button
              onClick={() => toggleUserAccordion(userId)}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-200"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                      {todos.length} টি প্ল্যান
                    </span>
                    {user.role && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 truncate">
                    {user.email}
                  </div>
                  {getUserLocation(user) && (
                    <div className="mt-1 text-xs text-gray-500 truncate">
                      📍 {getUserLocation(user)}
                    </div>
                  )}
                </div>
                <div className="flex items-center ml-4">
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-200 text-gray-400 ${
                      expandedUsers.has(userId) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Todos List */}
            {expandedUsers.has(userId) && (
              <div className="border-t border-gray-200 flex-1 overflow-hidden">
                <div className="p-4 max-h-96 overflow-y-auto">
                  {todos.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">কোন প্ল্যান নেই</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todos.map(todo => (
                        <div
                          key={todo.id}
                          className={`p-3 rounded-lg border ${getStatusColor(todo.status)} hover:shadow-sm transition-shadow duration-200`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">{todo.title}</h4>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white">
                              {todo.status}
                            </span>
                          </div>
                          
                          {todo.details && (
                            <p className="text-gray-700 mb-3 text-sm">{todo.details}</p>
                          )}
                          
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <div>
                              <span className="font-medium">তারিখ:</span>{' '}
                              {todo.scheduledDate 
                                ? new Date(todo.scheduledDate).toLocaleDateString('bn-BD')
                                : 'নির্ধারিত নেই'
                              }
                            </div>
                            
                            {todo.completedAt && (
                              <div>
                                <span className="font-medium">সম্পন্ন:</span>{' '}
                                {new Date(todo.completedAt).toLocaleDateString('bn-BD')}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-2">
                            তৈরি: {new Date(todo.createdAt).toLocaleDateString('bn-BD')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {Object.keys(groupedTodos).length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">কোন ডাটা পাওয়া যায়নি</h3>
            <p className="mt-1 text-sm text-gray-500">
              আপনার বর্তমান ফিল্টারে কোন প্ল্যান নেই।
            </p>
          </div>
        )}
      </div>
    </div>
  );
}