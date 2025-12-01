import React, { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button', ...props }) => {
    const base = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 shadow-md",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
        danger: "bg-red-50 text-red-600 hover:bg-red-100",
        ghost: "text-gray-600 hover:bg-gray-100"
    };
    return (
        <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

interface CardProps {
    children: ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
        {children}
    </div>
);

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input: React.FC<InputProps> = ({ label, type = "text", value, onChange, placeholder, required = false, min, className = '', ...props }) => {
    const id = React.useId();
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                min={min}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${className}`}
                {...props}
            />
        </div>
    );
};
