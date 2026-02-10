import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TickerItem } from '../types';
import { getShortCompanyName } from '../constants/stockNames';

interface TickerCardProps {
    ticker: TickerItem;
    onPress?: () => void;
}

export function TickerCard({ ticker, onPress }: TickerCardProps) {
    const netChange = parseFloat(ticker.netchange);
    const isPositive = netChange >= 0;
    const companyName = getShortCompanyName(ticker.security);

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-gray-800 rounded-xl p-3 mr-3 min-w-[140px] border border-gray-700"
        >
            <Text className="text-white font-bold text-sm" numberOfLines={1}>
                {ticker.security}
            </Text>
            <Text className="text-blue-400 text-xs" numberOfLines={1}>{companyName}</Text>
            <Text className="text-white text-lg font-semibold mt-1">
                Rs.{parseFloat(ticker.price).toFixed(2)}
            </Text>
            <View className="flex-row items-center mt-1">
                <View className={`px-2 py-0.5 rounded ${isPositive ? 'bg-green-900' : 'bg-red-900'}`}>
                    <Text className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{netChange.toFixed(2)}
                    </Text>
                </View>
                <Text className="text-gray-500 text-xs ml-2">{ticker.qty} qty</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">{ticker.time}</Text>
        </TouchableOpacity>
    );
}
