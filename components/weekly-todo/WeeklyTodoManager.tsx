"use client";

import { useState, useEffect } from "react";
import { WeeklyTodo, DateRangeType } from "@/types/weekly-todo";
import { weeklyTodoService } from "@/app/api/weekly-todo/services/route";
import AddTodoModal from "./AddTodoModal";
import TodoCard from "./TodoCard";

export default function WeeklyTodoManager() {
  const [todos, setTodos] = useState<WeeklyTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<WeeklyTodo | null>(null);

  // Filter states
  const [dateRange, setDateRange] = useState<DateRangeType>("this-week");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customDate, setCustomDate] = useState("");
  const [weekdayFilter, setWeekdayFilter] = useState<string>("all");

  // Get date range based on selection
  const getDateRange = (range: DateRangeType) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (range) {
      case "this-week":
        start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        end.setDate(start.getDate() + 6); // End of week (Saturday)
        break;
      case "last-week":
        start.setDate(now.getDate() - now.getDay() - 7);
        end.setDate(start.getDate() + 6);
        break;
      case "custom":
        if (!customDate)
          return { start: null, end: null };
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

  const fetchTodos = async () => {
    setLoading(true);
    setError("");

    try {
      const params: any = {};

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (weekdayFilter !== "all") {
        params.weekday = weekdayFilter;
      }

      const dateRangeValues = getDateRange(dateRange);
      if (dateRangeValues.start && dateRangeValues.end) {
        params.startDate = dateRangeValues.start;
        params.endDate = dateRangeValues.end;
      }

      const data = await weeklyTodoService.getTodos(params);
      setTodos(data);
    } catch (err) {
      setError("Failed to load todos. Please try again.");
      console.error("Error fetching todos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [dateRange, statusFilter, customDate, weekdayFilter]);

  const handleTodoAdded = () => {
    fetchTodos();
  };

  const handleTodoUpdated = () => {
    fetchTodos();
  };

  const handleTodoDeleted = () => {
    fetchTodos();
  };

  const handleEdit = (todo: WeeklyTodo) => {
    setEditingTodo(todo);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTodo(null);
  };

  const getStats = () => {
    const total = todos.length;
    const completed = todos.filter(
      (todo) => todo.status === "completed"
    ).length;
    const pending = todos.filter((todo) => todo.status === "pending").length;
    const cancelled = todos.filter(
      (todo) => todo.status === "cancelled"
    ).length;

    return { total, completed, pending, cancelled };
  };

  const stats = getStats();

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Plans</h1>
          <p className="text-gray-600 mt-2">
            Manage your weekly tasks and activities
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTodo(null);
            setIsAddModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          Add New Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-gray-600 text-sm">Total Plans</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.completed}
          </div>
          <div className="text-gray-600 text-sm">Completed</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-gray-600 text-sm">Pending</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {stats.cancelled}
          </div>
          <div className="text-gray-600 text-sm">Cancelled</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="this-week">This Week</option>
              <option value="last-week">Last Week</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date */}
          {dateRange === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Weekday Filter */}
        {dateRange !== "custom" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Day
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
                Full Week
              </button>
              {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                <button
                  key={day}
                  onClick={() => setWeekdayFilter(day.toLowerCase())}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    weekdayFilter === day.toLowerCase()
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={fetchTodos}
            disabled={loading}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Todos Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No plans found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first weekly plan.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setEditingTodo(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add New Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onTodoUpdated={handleTodoUpdated}
              onTodoDeleted={handleTodoDeleted}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Add Todo Modal */}
      <AddTodoModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onTodoAdded={handleTodoAdded}
        editingTodo={editingTodo}
      />
    </div>
  );
}
