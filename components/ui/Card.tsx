import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
    children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
    return (
        <View
            className={`bg-gray-800 rounded-2xl p-4 border border-gray-700 ${className}`}
            {...props}
        >
            {children}
        </View>
    );
}
