import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TextInput, TouchableOpacity, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from 'expo-router';
import { getTickerData, getOrderBook, hasStoredCredentials, getUserWatch } from '../../services/stockApi';
import { Card } from '../../components/ui/Card';
import { TickerCard } from '../../components/TickerCard';
import { OrderBookView } from '../../components/OrderBookView';
import { TickerItem, OrderBook, WatchListItem } from '../../types';
import { getShortCompanyName } from '../../constants/stockNames';

export default function MarketScreen() {
    const [ticker, setTicker] = useState<TickerItem[]>([]);
    const [watchList, setWatchList] = useState<WatchListItem[]>([]);
    const [selectedStock, setSelectedStock] = useState<string | null>(null);
    const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [orderBookLoading, setOrderBookLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasCredentials, setHasCredentials] = useState(false);

    const loadMarketData = useCallback(async () => {
        try {
            const hasCreds = await hasStoredCredentials();
            setHasCredentials(hasCreds);

            if (hasCreds) {
                // Fetch both ticker and watch list
                const [tickerData, watchListData] = await Promise.all([
                    getTickerData(),
                    getUserWatch().catch(e => {
                        console.error("Failed to load watch list", e);
                        return [];
                    })
                ]);

                setTicker(tickerData);
                setWatchList(watchListData);
            }
        } catch (error) {
            console.error('Error loading market data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadOrderBook = async (security: string) => {
        setOrderBookLoading(true);
        try {
            const data = await getOrderBook(security);
            setOrderBook(data);
            setSelectedStock(security);
        } catch (error) {
            console.error('Error loading order book:', error);
        } finally {
            setOrderBookLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchData = async () => {
                if (!isActive) return;
                await loadMarketData();
            };

            // Initial load
            fetchData();

            // Poll every 2 seconds
            const intervalId = setInterval(fetchData, 2000);

            return () => {
                isActive = false;
                clearInterval(intervalId);
            };
        }, [loadMarketData])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMarketData();
        if (selectedStock) {
            await loadOrderBook(selectedStock);
        }
        setRefreshing(false);
    };

    // Filter ticker by search
    const filteredTicker = ticker.filter((item) =>
        item.security.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter watch list by search
    const filteredWatchList = watchList.filter((item) =>
        item.security.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by positive/negative change
    const gainers = ticker.filter((t) => parseFloat(t.netchange) > 0).slice(0, 5);
    const losers = ticker.filter((t) => parseFloat(t.netchange) < 0).slice(0, 5);

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-4 pt-14 pb-4 bg-gray-800/50 border-b border-gray-700">
                <Text className="text-white text-2xl font-bold">Market</Text>

                {/* Search */}
                {hasCredentials && (
                    <View className="mt-3 bg-gray-800 rounded-xl flex-row items-center px-4 border border-gray-700">
                        <Text className="text-gray-400 mr-2">🔍</Text>
                        <TextInput
                            className="flex-1 py-3 text-white"
                            placeholder="Search stocks..."
                            placeholderTextColor="#6B7280"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                )}
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
                }
            >
                {!hasCredentials ? (
                    <Card className="items-center py-10">
                        <Text className="text-6xl mb-4">📈</Text>
                        <Text className="text-white text-xl font-bold text-center mb-2">
                            Connect Your Account
                        </Text>
                        <Text className="text-gray-400 text-center">
                            Add your stock portfolio credentials in the Profile tab to view market data
                        </Text>
                    </Card>
                ) : loading ? (
                    <View className="items-center py-20">
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text className="text-gray-400 mt-4">Loading market data...</Text>
                    </View>
                ) : (
                    <>
                        {/* Order Book (Shown at top if selected) */}


                        {/* Top Gainers */}
                        <Text className="text-white text-lg font-bold mb-3">🚀 Top Gainers</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-6 -mx-4 px-4"
                        >
                            {gainers.map((item) => (
                                <TickerCard
                                    key={item.id}
                                    ticker={item}
                                    onPress={() => loadOrderBook(item.security)}
                                />
                            ))}
                        </ScrollView>

                        {/* Top Losers */}
                        <Text className="text-white text-lg font-bold mb-3">📉 Top Losers</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-6 -mx-4 px-4"
                        >
                            {losers.map((item) => (
                                <TickerCard
                                    key={item.id}
                                    ticker={item}
                                    onPress={() => loadOrderBook(item.security)}
                                />
                            ))}
                        </ScrollView>

                        {/* Live Watch (Default Watch List) */}
                        <Text className="text-white text-lg font-bold mb-3">
                            Live Watch ({filteredWatchList.length})
                        </Text>
                        {filteredWatchList.length === 0 ? (
                            <Card className="items-center py-6 mb-4">
                                <Text className="text-gray-400">No stocks in watch list</Text>
                            </Card>
                        ) : (
                            filteredWatchList.map((item) => {
                                // Map WatchListItem to TickerItem
                                const mappedItem: TickerItem = {
                                    id: item.id || item.security,
                                    security: item.security,
                                    qty: item.tradesize,
                                    price: item.tradeprice,
                                    netchange: item.netchange,
                                    bookdefid: item.bookdefid,
                                    time: item.lasttradedtime
                                };

                                const netChange = parseFloat(mappedItem.netchange);
                                const isPositive = netChange >= 0;

                                return (
                                    <TouchableOpacity
                                        key={mappedItem.id}
                                        onPress={() => loadOrderBook(mappedItem.security)}
                                        className="bg-gray-800 rounded-xl p-4 mb-2 border border-gray-700"
                                    >
                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-1">
                                                <Text className="text-white font-bold">{mappedItem.security}</Text>
                                                <Text className="text-blue-400 text-sm" numberOfLines={1}>{getShortCompanyName(mappedItem.security)}</Text>
                                                <Text className="text-gray-400 text-xs">{mappedItem.qty} qty @ {mappedItem.time}</Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-white text-lg font-semibold">
                                                    Rs.{parseFloat(mappedItem.price).toFixed(2)}
                                                </Text>
                                                <Text className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                    {isPositive ? '+' : ''}{netChange.toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </>
                )}
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={!!selectedStock}
                onRequestClose={() => {
                    setSelectedStock(null);
                    setOrderBook(null);
                }}
            >
                <View className="flex-1 justify-center items-center px-4">
                    <BlurView
                        intensity={40}
                        tint="dark"
                        className="rounded-3xl w-full max-h-[70%] min-h-[300px] overflow-hidden border border-gray-600"
                        style={{ backgroundColor: 'rgba(17, 24, 39, 0.6)' }}
                    >
                        <View className="p-5 w-full h-full">
                            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-500/30">
                                <View>
                                    <Text className="text-white text-xl font-bold">{selectedStock}</Text>
                                    {selectedStock && <Text className="text-blue-300">{getShortCompanyName(selectedStock)}</Text>}
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedStock(null);
                                        setOrderBook(null);
                                    }}
                                    className="p-2 bg-gray-700/50 rounded-full"
                                >
                                    <Text className="text-gray-300 font-bold">✕</Text>
                                </TouchableOpacity>
                            </View>

                            {orderBookLoading ? (
                                <View className="flex-1 items-center justify-center py-10">
                                    <ActivityIndicator size="large" color="#3B82F6" />
                                </View>
                            ) : orderBook ? (
                                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                    <OrderBookView orderBook={orderBook} security={selectedStock || ''} />
                                </ScrollView>
                            ) : (
                                <View className="flex-1 items-center justify-center py-10">
                                    <Text className="text-gray-400">No order book data available</Text>
                                </View>
                            )}
                        </View>
                    </BlurView>
                </View>
            </Modal>
        </View>
    );
}
