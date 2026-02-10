import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from './ui/Card';
import { OrderBook as OrderBookType } from '../types';

interface OrderBookViewProps {
    orderBook: OrderBookType;
    security: string;
}

export function OrderBookView({ orderBook, security }: OrderBookViewProps) {
    return (
        <Card className="mb-4">
            <Text className="text-white text-lg font-bold mb-3">{security} Order Book</Text>

            <View className="flex-row">
                {/* Bids (Buy Orders) */}
                <View className="flex-1 mr-2">
                    <View className="bg-green-900/30 rounded-lg p-2 mb-2">
                        <Text className="text-green-400 text-center font-semibold">BID</Text>
                        <Text className="text-green-300 text-center text-xs">
                            Total: {parseInt(orderBook.totalbids).toLocaleString()}
                        </Text>
                    </View>
                    {orderBook.bid.slice(0, 5).map((bid, index) => (
                        <View key={index} className="flex-row justify-between py-2 border-b border-gray-700">
                            <Text className="text-gray-400 text-sm">{parseInt(bid.qty).toLocaleString()}</Text>
                            <Text className="text-green-400 font-medium">{parseFloat(bid.price).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Asks (Sell Orders) */}
                <View className="flex-1 ml-2">
                    <View className="bg-red-900/30 rounded-lg p-2 mb-2">
                        <Text className="text-red-400 text-center font-semibold">ASK</Text>
                        <Text className="text-red-300 text-center text-xs">
                            Total: {parseInt(orderBook.totalask).toLocaleString()}
                        </Text>
                    </View>
                    {orderBook.ask.slice(0, 5).map((ask, index) => (
                        <View key={index} className="flex-row justify-between py-2 border-b border-gray-700">
                            <Text className="text-red-400 font-medium">{parseFloat(ask.price).toFixed(2)}</Text>
                            <Text className="text-gray-400 text-sm">{parseInt(ask.qty).toLocaleString()}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </Card>
    );
}
