import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <View className="mb-4">
            {label && (
                <Text className="text-gray-300 text-sm mb-2 font-medium">{label}</Text>
            )}
            <TextInput
                className={`bg-gray-800 text-white px-4 py-4 rounded-xl border ${error ? 'border-red-500' : 'border-gray-700'
                    } ${className}`}
                placeholderTextColor="#6B7280"
                {...props}
            />
            {error && (
                <Text className="text-red-500 text-sm mt-1">{error}</Text>
            )}
        </View>
    );
}
