"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { WeeklyTodo, DateRangeType } from "@/types/weekly-todo";
import { weeklyTodoService } from "@/services/user-weekly-todo";
import AddTodoModal from "./AddTodoModal";
import TodoCard from "./TodoCard";
import WeekendWarningModal from "./WeekendWarningModal";

export default function WeeklyTodoManager() {
  const t = useTranslations("weeklyTodo.DayeWeeklyTodo");
  const [todos, setTodos] = useState<WeeklyTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWeekendWarningOpen, setIsWeekendWarningOpen] = useState(false);
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
        // Week defined as Saturday (6) → Friday (5)
        const currentDay = now.getDay(); // 0=Sun .. 6=Sat
        const daysToSubtract = (currentDay + 1) % 7; // Sat=>0, Sun=>1, Mon=>2, ...
        start.setDate(now.getDate() - daysToSubtract);
        end.setDate(start.getDate() + 6);
        break;
      case "last-week":
        // Compute last week's Saturday by taking this week's Saturday and subtracting 7 days
        const currentDayForLast = now.getDay();
        const daysSinceThisWeekSaturday = (currentDayForLast + 1) % 7;
        start.setDate(now.getDate() - daysSinceThisWeekSaturday - 7);
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
      setError(t("errors.loadFailed"));
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
    openAddModal(todo);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTodo(null);
  };

  const isWeekendToday = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  };

  const openAddModal = (todo: WeeklyTodo | null = null) => {
    if (isWeekendToday()) {
      setEditingTodo(todo);
      setIsAddModalOpen(true);
      return;
    }
    setEditingTodo(null);
    setIsAddModalOpen(false);
    setIsWeekendWarningOpen(true);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20">
      {/* Header with Gradient */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] rounded-b-xl p-8 shadow-2xl mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex-1 mb-6 lg:mb-0">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
                {t("title")}
              </h1>
              <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
                {t("subtitle")}
              </p>
            </div>
            <button
              onClick={() => openAddModal(null)}
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-white/30 border border-white/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl font-semibold text-lg flex items-center group"
            >
              <svg
                className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {t("addPlan")}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6 text-center">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
            <svg
              className="w-7 h-7 text-white"
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
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.total}
          </div>
          <div className="text-gray-600 font-medium">{t("stats.total")}</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6 text-center">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
            <svg
              className="w-7 h-7 text-white"
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
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.completed}
          </div>
          <div className="text-gray-600 font-medium">
            {t("stats.completed")}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6 text-center">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 shadow-lg">
            <svg
              className="w-7 h-7 text-white"
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
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {stats.pending}
          </div>
          <div className="text-gray-600 font-medium">{t("stats.pending")}</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6 text-center">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-red-600 mb-2">
            {stats.cancelled}
          </div>
          <div className="text-gray-600 font-medium">
            {t("stats.cancelled")}
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] rounded-full mr-2"></div>
                {t("filters.dateRange")}
              </div>
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeType)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B809B]/50 focus:border-[#1B809B] transition-all duration-200 bg-white/50 backdrop-blur-sm"
            >
              <option value="this-week">{t("dateRange.thisWeek")}</option>
              <option value="last-week">{t("dateRange.lastWeek")}</option>
              <option value="custom">{t("dateRange.custom")}</option>
            </select>
          </div>

          {/* Custom Date */}
          {dateRange === "custom" && (
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
          )}

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
        </div>

        {/* Weekday Filter */}
        {dateRange !== "custom" && (
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

        {/* Summary and Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200/50">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            <span className="font-semibold text-[#1B809B]">{todos.length}</span>{" "}
            {t("showingPlans")}
          </div>
          <button
            onClick={fetchTodos}
            disabled={loading}
            className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center ${
              loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("refreshing")}
              </>
            ) : (
              <>
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
              </>
            )}
          </button>
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

      {/* Todos Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1B809B] mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">{t("loading")}</p>
          </div>
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
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
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {t("noPlans")}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {t("noPlansDescription")}
          </p>
          <button
            onClick={() => openAddModal(null)}
            className="bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center mx-auto"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {t("addPlan")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

      <WeekendWarningModal
        isOpen={isWeekendWarningOpen}
        onClose={() => setIsWeekendWarningOpen(false)}
      />
    </div>
  );
}
