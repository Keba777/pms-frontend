"use client";

import React from "react";

const TodoCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden animate-pulse h-[300px]">
            {/* Header Skeleton */}
            <div className="bg-primary/10 px-5 py-4 flex justify-between items-center">
                <div className="h-6 w-1/3 bg-primary/20 rounded"></div>
                <div className="h-5 w-20 bg-primary/20 rounded-full"></div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full col-span-1"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>

                    <div className="col-span-2 flex justify-between">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                    </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>

                {/* Status */}
                <div className="flex justify-between items-center mt-2">
                    <div className="h-5 w-24 bg-gray-200 rounded-full"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-muted/50 h-2 rounded-full w-1/3" />
                </div>
            </div>
        </div>
    );
};

export default TodoCardSkeleton;
