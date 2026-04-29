"use client";

import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col gap-6 p-6">
      <div className="h-14 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse w-3/4" />
      <div className="h-10 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse w-1/4" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="space-y-4">
          <div className="h-6 rounded bg-gray-200 dark:bg-gray-800 animate-pulse w-2/3" />
          <div className="h-44 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-6 rounded bg-gray-200 dark:bg-gray-800 animate-pulse w-2/3" />
          <div className="h-44 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-6 rounded bg-gray-200 dark:bg-gray-800 animate-pulse w-2/3" />
          <div className="h-44 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
