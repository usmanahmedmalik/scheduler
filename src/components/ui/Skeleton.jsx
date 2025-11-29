import React from 'react';

export function Skeleton({ className = "", variant = "text" }) {
    const baseClasses = "animate-pulse bg-gray-200 rounded";

    let variantClasses = "";
    switch (variant) {
        case "circular":
            variantClasses = "rounded-full";
            break;
        case "rectangular":
            variantClasses = ""; // Default rounded from base
            break;
        case "text":
        default:
            variantClasses = "h-4 w-full";
            break;
    }

    return (
        <div className={`${baseClasses} ${variantClasses} ${className}`} />
    );
}
