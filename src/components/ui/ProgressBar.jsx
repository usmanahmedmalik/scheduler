import React from 'react';

export function ProgressBar({ currentStep, totalSteps, labels = [] }) {
    const progress = Math.min(100, Math.max(0, ((currentStep - 1) / (totalSteps - 1)) * 100));

    return (
        <div className="w-full">
            {/* Step Indicators */}
            <div className="flex justify-between mb-2">
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum <= currentStep;
                    const isCompleted = stepNum < currentStep;

                    return (
                        <div key={index} className="flex flex-col items-center relative z-10">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 
                                ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}
                                `}
                            >
                                {isCompleted ? '✓' : stepNum}
                            </div>
                            {labels[index] && (
                                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {labels[index]}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress Line Background */}
            <div className="relative w-full h-2 bg-gray-200 rounded-full -mt-8 mb-8 z-0">
                {/* Active Progress Line */}
                <div
                    className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
