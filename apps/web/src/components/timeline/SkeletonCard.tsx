import React from "react";

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-nord-snow0 dark:bg-nord-polar1 rounded-lg border border-nord-snow2 dark:border-nord-polar3 p-5 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-nord-snow2 dark:bg-nord-polar3 rounded w-2/3"></div>
        <div className="h-3 bg-nord-snow2 dark:bg-nord-polar3 rounded w-16"></div>
      </div>

      <div className="space-y-2">
        <div className="h-4 bg-nord-snow2 dark:bg-nord-polar3 rounded w-full"></div>
        <div className="h-4 bg-nord-snow2 dark:bg-nord-polar3 rounded w-5/6"></div>
        <div className="h-4 bg-nord-snow2 dark:bg-nord-polar3 rounded w-4/6"></div>
      </div>

      <div className="mt-4 flex gap-2">
        <div className="h-4 bg-nord-snow2 dark:bg-nord-polar3 rounded-full w-12"></div>
        <div className="h-4 bg-nord-snow2 dark:bg-nord-polar3 rounded-full w-16"></div>
      </div>
    </div>
  );
};
