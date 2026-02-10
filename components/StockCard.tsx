import React from 'react';
import { View, Text } from 'react-native';
import { Card } from './ui/Card';
import { StockHolding } from '../types';
import { getCompanyName } from '../constants/stockNames';

interface StockCardProps {
    stock: StockHolding;
}

export function StockCard({ stock }: StockCardProps) {
    const isProfit = stock.netGain >= 0;
    const percentChange = ((stock.marketValue - stock.totCost) / stock.totCost) * 100;
    const companyName = getCompanyName(stock.security);

    return (
        <Card className="mb-3">
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                    <Text className="text-white text-lg font-bold">{stock.security}</Text>
                    <Text className="text-blue-400 text-sm" numberOfLines={1}>{companyName}</Text>
                    <Text className="text-gray-400 text-sm mt-1">
                        {stock.quantity} shares @ Rs.{parseFloat(stock.avgPrice.toString()).toFixed(2)}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-white text-lg font-semibold">
                        Rs.{parseFloat(stock.marketValue.toString()).toLocaleString()}
                    </Text>
                    <View className={`px-2 py-1 rounded-lg ${isProfit ? 'bg-green-900' : 'bg-red-900'}`}>
                        <Text className={`text-sm font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                            {isProfit ? '+' : ''}Rs.{parseFloat(stock.netGain.toString()).toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-700">
                <View>
                    <Text className="text-gray-500 text-xs">Last Traded</Text>
                    <Text className="text-white">Rs.{parseFloat(stock.lastTraded.toString()).toFixed(2)}</Text>
                </View>
                <View>
                    <Text className="text-gray-500 text-xs">Total Cost</Text>
                    <Text className="text-white">Rs.{parseFloat(stock.totCost.toString()).toFixed(2)}</Text>
                </View>
                <View className="items-end">
                    <Text className="text-gray-500 text-xs">Change</Text>
                    <Text className={isProfit ? 'text-green-400' : 'text-red-400'}>
                        {isProfit ? '+' : ''}{percentChange.toFixed(2)}%
                    </Text>
                </View>
            </View>
        </Card>
    );
}
