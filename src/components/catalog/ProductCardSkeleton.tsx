import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs animate-pulse flex flex-col">
      {/* Image Skeleton */}
      <div className="h-44 bg-slate-200 dark:bg-slate-700 w-full relative">
        <div className="absolute top-2 left-2 w-16 h-5 bg-slate-300 dark:bg-slate-600 rounded-full" />
        <div className="absolute top-2 right-2 w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Category & City */}
          <div className="flex items-center justify-between">
            <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>

          {/* Title */}
          <div className="w-4/5 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="w-3/5 h-3 bg-slate-100 dark:bg-slate-700/60 rounded" />
        </div>

        {/* Pricing Skeleton */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="w-24 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="w-16 h-3 bg-slate-100 dark:bg-slate-700/60 rounded" />
          </div>

          {/* Action Button Skeleton */}
          <div className="w-full h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
