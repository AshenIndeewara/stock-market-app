import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getSectorData, getSectorWatch, hasStoredCredentials } from '../../services/stockApi';
import { Card } from '../../components/ui/Card';
import { SectorInfo, SectorStock } from '../../types';

export default function SectorsScreen() {
    const [sectors, setSectors] = useState<SectorInfo[]>([]);
    const [selectedSector, setSelectedSector] = useState<SectorInfo | null>(null);
    const [sectorStocks, setSectorStocks] = useState<SectorStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [stocksLoading, setStocksLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasCredentials, setHasCredentials] = useState(false);

    const loadSectorData = useCallback(async () => {
        try {
            const hasCreds = await hasStoredCredentials();
            setHasCredentials(hasCreds);

            if (hasCreds) {
                const data = await getSectorData();
                // Sort sectors alphabetically by description
                const sorted = data.sort((a, b) => a.desc.localeCompare(b.desc));
                setSectors(sorted);
            }
        } catch (error) {
            console.error('Error loading sectors:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadSectorStocks = async (sector: SectorInfo) => {
        setSelectedSector(sector);
        setStocksLoading(true);
        try {
            const data = await getSectorWatch(sector.code);
            // Sort by turnover descending
            const sorted = data.sort((a, b) => {
                const turnoverA = parseFloat(a.totturnover.replace(/,/g, '')) || 0;
                const turnoverB = parseFloat(b.totturnover.replace(/,/g, '')) || 0;
                return turnoverB - turnoverA;
            });
            setSectorStocks(sorted);
        } catch (error) {
            console.error('Error loading sector stocks:', error);
            setSectorStocks([]);
        } finally {
            setStocksLoading(false);
        }
    };

    useEffect(() => {
        loadSectorData();
    }, [loadSectorData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSectorData();
        if (selectedSector) {
            await loadSectorStocks(selectedSector);
        }
        setRefreshing(false);
    };

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-4 pt-14 pb-4 bg-gray-800/50 border-b border-gray-700">
                <Text className="text-white text-2xl font-bold">Sectors</Text>
                {selectedSector && (
                    <TouchableOpacity onPress={() => { setSelectedSector(null); setSectorStocks([]); }}>
                        <Text className="text-blue-400 mt-1">← Back to Sectors</Text>
                    </TouchableOpacity>
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
                        <Text className="text-6xl mb-4">📊</Text>
                        <Text className="text-white text-xl font-bold text-center mb-2">
                            Connect Your Account
                        </Text>
                        <Text className="text-gray-400 text-center">
                            Add your stock portfolio credentials to view sector data
                        </Text>
                    </Card>
                ) : loading ? (
                    <View className="items-center py-20">
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text className="text-gray-400 mt-4">Loading sectors...</Text>
                    </View>
                ) : selectedSector ? (
                    // Sector Stocks View
                    <>
                        <Card className="mb-4">
                            <Text className="text-white text-xl font-bold">{selectedSector.desc}</Text>
                            <Text className="text-gray-400 text-sm">Sector Code: {selectedSector.code}</Text>
                        </Card>

                        {stocksLoading ? (
                            <View className="items-center py-10">
                                <ActivityIndicator size="small" color="#3B82F6" />
                                <Text className="text-gray-400 mt-2">Loading stocks...</Text>
                            </View>
                        ) : sectorStocks.length === 0 ? (
                            <Card className="items-center py-10">
                                <Text className="text-gray-400">No stocks in this sector</Text>
                            </Card>
                        ) : (
                            <>
                                <Text className="text-white text-lg font-bold mb-3">
                                    Stocks ({sectorStocks.length})
                                </Text>
                                {sectorStocks.map((stock) => {
                                    const netChange = parseFloat(stock.netchange) || 0;
                                    const perChange = parseFloat(stock.perchange) || 0;
                                    const isPositive = netChange >= 0;
                                    const tradePrice = parseFloat(stock.tradeprice) || 0;
                                    const turnover = stock.totturnover;

                                    return (
                                        <Card key={stock.id} className="mb-3">
                                            <View className="flex-row justify-between items-start">
                                                <View className="flex-1 mr-3">
                                                    <Text className="text-white text-lg font-bold">{stock.security}</Text>
                                                    <Text className="text-blue-400 text-sm" numberOfLines={1}>
                                                        {stock.companyname}
                                                    </Text>
                                                    <Text className="text-gray-500 text-xs mt-1">
                                                        {stock.tradestatus} • {stock.marketSegment}
                                                    </Text>
                                                </View>
                                                <View className="items-end">
                                                    <Text className="text-white text-lg font-semibold">
                                                        Rs.{tradePrice.toFixed(2)}
                                                    </Text>
                                                    <View className={`px-2 py-0.5 rounded ${isPositive ? 'bg-green-900' : 'bg-red-900'}`}>
                                                        <Text className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                            {isPositive ? '+' : ''}{netChange.toFixed(2)} ({perChange.toFixed(2)}%)
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-700">
                                                <View>
                                                    <Text className="text-gray-500 text-xs">High / Low</Text>
                                                    <Text className="text-white text-sm">{stock.highpx} / {stock.lowpx}</Text>
                                                </View>
                                                <View>
                                                    <Text className="text-gray-500 text-xs">Volume</Text>
                                                    <Text className="text-white text-sm">{stock.totvolume}</Text>
                                                </View>
                                                <View className="items-end">
                                                    <Text className="text-gray-500 text-xs">Turnover</Text>
                                                    <Text className="text-white text-sm">{turnover}</Text>
                                                </View>
                                            </View>

                                            <View className="flex-row justify-between mt-2">
                                                <View>
                                                    <Text className="text-gray-500 text-xs">Bid</Text>
                                                    <Text className="text-green-400 text-sm">{stock.bidqty} @ {stock.bidprice}</Text>
                                                </View>
                                                <View className="items-end">
                                                    <Text className="text-gray-500 text-xs">Ask</Text>
                                                    <Text className="text-red-400 text-sm">{stock.askqty} @ {stock.askprice}</Text>
                                                </View>
                                            </View>
                                        </Card>
                                    );
                                })}
                            </>
                        )}
                    </>
                ) : (
                    // Sectors List View
                    <>
                        <Text className="text-white text-lg font-bold mb-3">
                            All Sectors ({sectors.length})
                        </Text>
                        {sectors.map((sector) => (
                            <TouchableOpacity
                                key={sector.code}
                                onPress={() => loadSectorStocks(sector)}
                                className="bg-gray-800 rounded-xl p-4 mb-2 border border-gray-700 flex-row justify-between items-center"
                            >
                                <View className="flex-1">
                                    <Text className="text-white font-bold">{sector.desc}</Text>
                                    <Text className="text-gray-500 text-xs">Code: {sector.code}</Text>
                                </View>
                                <Text className="text-gray-400 text-xl">›</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
