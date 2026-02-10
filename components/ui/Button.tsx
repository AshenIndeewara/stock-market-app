import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, disabled, className, ...props }: ButtonProps) {
    const variantStyles = {
        primary: 'bg-blue-600 active:bg-blue-700',
        secondary: 'bg-gray-600 active:bg-gray-700',
        danger: 'bg-red-600 active:bg-red-700',
    };

    return (
        <TouchableOpacity
            className={`py-4 px-6 rounded-xl ${variantStyles[variant]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white text-center font-semibold text-base">{title}</Text>
            )}
        </TouchableOpacity>
    );
}
