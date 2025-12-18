"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";
import { useParentEmail } from "@/hooks/useParentEmail";

// Debounce utility function
const debounce = <F extends (...args: any[]) => void>(
  func: F,
  wait: number
) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
import { WeeklyTodo, User } from "@/types/weekly-todo";
import { adminWeeklyTodoService } from "@/services/admin-weekly-todo";

interface DirectoryUser extends Omit<User, 'division' | 'district' | 'upazila' | 'union'> {
  role: string;
  division?: string | null;
  district?: string | null;
  upazila?: string | null;
  union?: string | null;
  markaz?: string | { name: string; id?: string } | { id: string; name: string }[] | null;
}

// Utility function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  
  // Get the text content
  const textContent = tempDiv.textContent || tempDiv.innerText || "";
  
  // Clean up extra whitespace
  return textContent.replace(/\s+/g, " ").trim();
};

interface GroupedTodos {
  [userId: string]: {
    user: User;
    todos: WeeklyTodo[];
  };
}

export default function AdminWeeklyTodoView() {
  const t = useTranslations("weeklyTodo.adminWeeklyTodo");
  const { data: session } = useSession();
  const { getParentEmail } = useParentEmail();
  const [apiTodos, setApiTodos] = useState<WeeklyTodo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<WeeklyTodo[]>([]);
  const [groupedTodos, setGroupedTodos] = useState<GroupedTodos>({});
  const [users, setUsers] = useState<User[]>([]);
  const [userDirectory, setUserDirectory] = useState<DirectoryUser[]>([]);
  const [allowedUserIds, setAllowedUserIds] = useState<string[]>([]);
  const [allowedUserEmails, setAllowedUserEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Filters
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<
    "this-week" | "last-week" | "custom" | "all"
  >("this-week");
  const [customDate, setCustomDate] = useState("");
  const [weekdayFilter, setWeekdayFilter] = useState<string>("all");
  const [nameSearch, setNameSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const applyScope = useCallback(
    (todos: WeeklyTodo[]) => {
      if (allowedUserIds.length === 0 && allowedUserEmails.length === 0) {
        return todos;
      }

      return todos.filter((todo) => {
        const todoUserId = todo.user?.id || todo.userId;
        const todoUserEmail = todo.user?.email;

        if (todoUserId && allowedUserIds.includes(todoUserId)) return true;
        if (todoUserEmail && allowedUserEmails.includes(todoUserEmail))
          return true;

        return false;
      });
    },
    [allowedUserEmails, allowedUserIds]
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        const fetchedUsers: DirectoryUser[] = Array.isArray(payload)
          ? payload
          : payload?.users || [];
        setUserDirectory(fetchedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!session?.user?.email || userDirectory.length === 0) return;

    const loggedUser =
      userDirectory.find((u) => u.email === session.user.email) || null;

    if (!loggedUser) {
      setAllowedUserEmails([session.user.email]);
      return;
    }

    const emailSet = new Set<string>();
    const idSet = new Set<string>();

    const addUser = (user: DirectoryUser) => {
      if (user.email) emailSet.add(user.email);
      if (user.id) idSet.add(user.id);
    };

    addUser(loggedUser);

    const collectChildren = (parentEmail: string) => {
      userDirectory.forEach((user) => {
        const parentEmailForUser = getParentEmail(
          user,
          userDirectory,
          loggedUser
        );

        if (parentEmailForUser === parentEmail && user.email) {
          addUser(user);
          collectChildren(user.email);
        }
      });
    };

    collectChildren(loggedUser.email);
    setAllowedUserEmails(Array.from(emailSet));
    setAllowedUserIds(Array.from(idSet));
  }, [session?.user?.email, userDirectory]);

  // Get date range
  const getDateRange = () => {
    const now = new Date();
    let start: Date, end: Date;

    switch (dateRange) {
      case "this-week":
        // Week defined as Saturday (6) → Friday (5)
        // Compute how many days we should subtract from today to get the most recent Saturday
        const currentDay = now.getDay(); // 0=Sun .. 6=Sat
        const daysToSubtract = (currentDay + 1) % 7; // e.g. Sat=>0, Sun=>1, Mon=>2, ...
        start = new Date(now);
        start.setDate(now.getDate() - daysToSubtract);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case "last-week":
        // Compute last week's Saturday by taking this week's Saturday and subtracting 7 days
        const currentDayForLast = now.getDay();
        const daysSinceThisWeekSaturday = (currentDayForLast + 1) % 7; // same as daysToSubtract above
        start = new Date(now);
        start.setDate(now.getDate() - daysSinceThisWeekSaturday - 7);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case "custom":
        if (!customDate) return { start: null, end: null };
        return {
          start: customDate,
          end: customDate,
        };
      default:
        return { start: null, end: null };
    }

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  // Function to filter todos based on search term
  const filterTodos = (todos: WeeklyTodo[], search: string) => {
    if (!search) return [...todos];
    
    const searchTerm = search.toLowerCase();
    return todos.filter(todo => 
      todo.user && (
        todo.user.name?.toLowerCase().includes(searchTerm) ||
        todo.user.phone?.includes(searchTerm) ||
        todo.user.email?.toLowerCase().includes(searchTerm)
      )
    );
  };

  // Function to group todos by user
  const groupTodosByUser = (todos: WeeklyTodo[]) => {
    const grouped: GroupedTodos = {};
    const userMap = new Map<string, User>();
    
    todos.forEach((todo) => {
      if (!todo.user) return;

      const userId = todo.user.id;
      if (!grouped[userId]) {
        grouped[userId] = {
          user: todo.user,
          todos: [],
        };
        userMap.set(userId, todo.user);
      }
      grouped[userId].todos.push(todo);
    });

    setUsers(Array.from(userMap.values()));
    setGroupedTodos(grouped);

    // Auto-expand if only one user or specific user selected
    if (selectedUser !== "all") {
      setExpandedUsers(new Set([selectedUser]));
    } else if (Object.keys(grouped).length === 1) {
      setExpandedUsers(new Set([Object.keys(grouped)[0]]));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const dateRangeValues = getDateRange();
      const data = await adminWeeklyTodoService.getAdminTodos({
        status: statusFilter !== "all" ? statusFilter : undefined,
        userId: selectedUser !== "all" ? selectedUser : undefined,
        weekday: weekdayFilter !== "all" ? weekdayFilter : undefined,
        startDate: dateRangeValues.start || undefined,
        endDate: dateRangeValues.end || undefined,
      });

      setApiTodos(data.todos);
    } catch (err) {
      setError(t("errors.loadFailed"));
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setNameSearch(value);
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // For immediate feedback, we can show a loading state or debounce
    // For now, we'll just use the debounced search
    debouncedSearch(value);
  };

  // Focus the search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Fetch data when filters change (except search)
  useEffect(() => {
    fetchData();
    // We only want to refetch when these dependencies change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, statusFilter, dateRange, customDate, weekdayFilter]);

  useEffect(() => {
    const scoped = applyScope(apiTodos);
    const filtered = filterTodos(scoped, nameSearch);
    setFilteredTodos(filtered);
    groupTodosByUser(filtered);
  }, [apiTodos, applyScope, nameSearch]);

  const toggleUserAccordion = (userId: string) => {
    setExpandedUsers((prev) => {
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
      case "completed":
        return "bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800";
      case "cancelled":
        return "bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800";
      default:
        return "bg-gradient-to-r from-yellow-50 to-amber-100 border-yellow-200 text-yellow-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      default:
        return "bg-gradient-to-r from-yellow-500 to-amber-600 text-white";
    }
  };

  const getUserLocation = (user: User) => {
    const locationParts = [];
    if (user.division) locationParts.push(user.division);
    if (user.district) locationParts.push(user.district);
    if (user.upazila) locationParts.push(user.upazila);
    if (user.union) locationParts.push(user.union);
    return locationParts.join(" → ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1B809B] mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header with Gradient */}
      <div className="mb-8 text-center">
        <div className="bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] rounded-b-xl p-8 shadow-xl mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
            {t("title")}
          </h1>
          <p className="text-blue-100 text-lg opacity-90">{t("subtitle")}</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Name Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] rounded-full mr-2"></div>
                {t("filters.user")}
              </div>
            </label>
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by name, email, or phone"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B809B]/50 focus:border-[#1B809B] transition-all duration-200 bg-white/50 backdrop-blur-sm"
            />
          </div>
          {/* User Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] rounded-full mr-2"></div>
                {t("filters.user")}
              </div>
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B809B]/50 focus:border-[#1B809B] transition-all duration-200 bg-white/50 backdrop-blur-sm"
            >
              <option value="all">{t("filters.allUsers")}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] rounded-full mr-2"></div>
                {t("filters.status")}
              </div>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B809B]/50 focus:border-[#1B809B] transition-all duration-200 bg-white/50 backdrop-blur-sm"
            >
              <option value="all">{t("filters.allStatus")}</option>
              <option value="pending">{t("status.pending")}</option>
              <option value="completed">{t("status.completed")}</option>
              <option value="cancelled">{t("status.cancelled")}</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] rounded-full mr-2"></div>
                {t("filters.dateRange")}
              </div>
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B809B]/50 focus:border-[#1B809B] transition-all duration-200 bg-white/50 backdrop-blur-sm"
            >
              <option value="this-week">{t("dateRange.thisWeek")}</option>
              <option value="last-week">{t("dateRange.lastWeek")}</option>
              <option value="custom">{t("dateRange.custom")}</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end space-x-3">
            <button
              onClick={fetchData}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {t("refresh")}
              </div>
            </button>
          </div>
        </div>

        {/* Custom Date */}
        {dateRange === "custom" && (
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t("filters.selectDate")}
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B809B]/50 focus:border-[#1B809B] transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
        )}

        {/* Weekday Filter */}
        {dateRange !== "custom" && dateRange !== "all" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t("filters.byDay")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setWeekdayFilter("all")}
                className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-0.5 ${
                  weekdayFilter === "all"
                    ? "bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] text-white shadow-lg"
                    : "bg-white/50 text-gray-700 hover:bg-white/80 border border-gray-200 backdrop-blur-sm"
                }`}
              >
                {t("weekdays.fullWeek")}
              </button>
              {[
                { name: t("weekdays.saturday"), value: "saturday" },
                { name: t("weekdays.sunday"), value: "sunday" },
                { name: t("weekdays.monday"), value: "monday" },
                { name: t("weekdays.tuesday"), value: "tuesday" },
                { name: t("weekdays.wednesday"), value: "wednesday" },
                { name: t("weekdays.thursday"), value: "thursday" },
                { name: t("weekdays.friday"), value: "friday" },
              ].map((day) => (
                <button
                  key={day.value}
                  onClick={() => setWeekdayFilter(day.value)}
                  className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-0.5 ${
                    weekdayFilter === day.value
                      ? "bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] text-white shadow-lg"
                      : "bg-white/50 text-gray-700 hover:bg-white/80 border border-gray-200 backdrop-blur-sm"
                  }`}
                >
                  {day.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Accordion Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200/50">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            <span className="font-semibold text-[#1B809B]">
              {Object.keys(groupedTodos).length}
            </span>{" "}
            {t("totalUsers")}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              {t("expandAll")}
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              {t("collapseAll")}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 shadow-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* User Accordions Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {Object.entries(groupedTodos).map(([userId, { user, todos }]) => (
          <div
            key={userId}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col group"
          >
            {/* User Header with Gradient */}
            <button
              onClick={() => toggleUserAccordion(userId)}
              className="w-full px-6 py-5 text-left hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/30 focus:outline-none focus:ring-2 focus:ring-[#1B809B]/50 focus:ring-inset transition-all duration-200 bg-gradient-to-r from-white to-blue-50/30"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate mb-2 group-hover:text-[#1B809B] transition-colors duration-200">
                    {user.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] text-white text-xs font-semibold shadow-lg">
                      {todos.length} {t("plans")}
                    </span>
                    {user.role && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold shadow-lg">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 truncate mb-2">
                    📧 {user.email}
                  </div>
                  {getUserLocation(user) && (
                    <div className="text-xs text-gray-500 truncate flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
                      {getUserLocation(user)}
                    </div>
                  )}
                </div>
                <div className="flex items-center ml-4">
                  <svg
                    className={`w-6 h-6 transform transition-transform duration-200 text-[#1B809B] ${
                      expandedUsers.has(userId) ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* Todos List */}
            {expandedUsers.has(userId) && (
              <div className="border-t border-gray-200/50 flex-1 overflow-hidden bg-gradient-to-b from-white to-blue-50/20">
                <div className="p-4 max-h-96 overflow-y-auto">
                  {todos.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">
                        {t("noPlans")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todos.map((todo) => (
                        <div
                          key={todo.id}
                          className={`p-4 rounded-xl border ${getStatusColor(todo.status)} hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-gray-900 pr-2">
                              {todo.title}
                            </h4>
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeColor(todo.status)} shadow-lg`}
                            >
                              {todo.status === "completed"
                                ? t("status.completed")
                                : todo.status === "cancelled"
                                  ? t("status.cancelled")
                                  : t("status.pending")}
                            </span>
                          </div>

                          {todo.details && (
                            <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                              {stripHtmlTags(todo.details)}
                            </p>
                          )}

                          <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                            <div className="flex items-center">
                              <svg
                                className="w-3 h-3 mr-1 text-[#1B809B]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="font-medium">{t("date")}:</span>
                              <span className="ml-1">
                                {todo.scheduledDate
                                  ? new Date(
                                      todo.scheduledDate
                                    ).toLocaleDateString("bn-BD")
                                  : t("notScheduled")}
                              </span>
                            </div>

                            {todo.completedAt && (
                              <div className="flex items-center text-green-600">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="font-medium">
                                  {t("completed")}:
                                </span>
                                <span className="ml-1">
                                  {new Date(
                                    todo.completedAt
                                  ).toLocaleDateString("bn-BD")}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-gray-500 flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {t("created")}:{" "}
                            {new Date(todo.createdAt).toLocaleDateString(
                              "bn-BD"
                            )}
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
          <div className="col-span-full text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("noData")}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {t("noDataDescription")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
