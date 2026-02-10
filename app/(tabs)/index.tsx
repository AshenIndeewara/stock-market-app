import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { router } from 'expo-router';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { getPortfolio, hasStoredCredentials } from '../../services/stockApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StockCard } from '../../components/StockCard';
import { StockHolding, PortfolioCredentials } from '../../types';

export default function PortfolioScreen() {
    const { user } = useAuth();
    const [portfolios, setPortfolios] = useState<PortfolioCredentials[]>([]);
    const [activePortfolio, setActivePortfolio] = useState<PortfolioCredentials | null>(null);
    const [holdings, setHoldings] = useState<StockHolding[]>([]);
    const [totalValue, setTotalValue] = useState(0);
    const [totalGain, setTotalGain] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasCredentials, setHasCredentials] = useState(false);

    // Load portfolios from Firestore
    const loadPortfolios = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const q = query(
                collection(db, 'portfolios'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(q);
            const portfolioList: PortfolioCredentials[] = [];

            snapshot.forEach((docSnapshot) => {
                portfolioList.push({ id: docSnapshot.id, ...docSnapshot.data() } as PortfolioCredentials);
            });

            setPortfolios(portfolioList);

            // Set active portfolio
            const active = portfolioList.find((p) => p.isActive) || portfolioList[0];
            if (active) {
                setActivePortfolio(active);
            }

            // Check if has stored API credentials
            const hasCreds = await hasStoredCredentials();
            setHasCredentials(hasCreds);
        } catch (error: any) {
            console.error('Error loading portfolios:', error);
            // If offline or error, just set empty state
            setPortfolios([]);
            setLoading(false);
        }
    }, [user]);

    // Load portfolio holdings
    const loadHoldings = useCallback(async () => {
        if (!activePortfolio) {
            setLoading(false);
            return;
        }

        try {
            const data = await getPortfolio(
                activePortfolio.exchange,
                activePortfolio.broker,
                activePortfolio.clientAccount
            );

            setHoldings(data.portfolios);
            setTotalValue(data.markerValTot[0] || 0);

            // Calculate total gain
            const gain = data.portfolios.reduce((sum, stock) => sum + stock.netGain, 0);
            setTotalGain(gain);
        } catch (error: any) {
            console.error('Error loading holdings:', error);
            if (error.message.includes('credentials')) {
                setHasCredentials(false);
            }
        } finally {
            setLoading(false);
        }
    }, [activePortfolio]);

    useEffect(() => {
        loadPortfolios();
    }, [loadPortfolios]);

    useEffect(() => {
        if (activePortfolio && hasCredentials) {
            loadHoldings();
        } else {
            setLoading(false);
        }
    }, [activePortfolio, hasCredentials, loadHoldings]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPortfolios();
        await loadHoldings();
        setRefreshing(false);
    };

    const switchPortfolio = async (portfolio: PortfolioCredentials) => {
        if (!user) return;

        // Update all portfolios to inactive
        for (const p of portfolios) {
            if (p.isActive) {
                await updateDoc(doc(db, 'portfolios', p.id), { isActive: false });
            }
        }

        // Set new active portfolio
        await updateDoc(doc(db, 'portfolios', portfolio.id), { isActive: true });
        setActivePortfolio(portfolio);

        // Reload holdings
        setLoading(true);
        await loadHoldings();
    };

    const isProfit = totalGain >= 0;

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-4 pt-14 pb-4 bg-gray-800/50 border-b border-gray-700">
                <Text className="text-white text-2xl font-bold">Portfolio</Text>

                {/* Portfolio Switcher */}
                {portfolios.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mt-3 -mx-4 px-4"
                    >
                        {portfolios.map((portfolio) => (
                            <TouchableOpacity
                                key={portfolio.id}
                                onPress={() => switchPortfolio(portfolio)}
                                className={`mr-3 px-4 py-2 rounded-full ${activePortfolio?.id === portfolio.id
                                    ? 'bg-blue-600'
                                    : 'bg-gray-700'
                                    }`}
                            >
                                <Text className="text-white font-medium">{portfolio.portfolioName}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
                }
            >
                {/* No portfolio setup */}
                {!hasCredentials || portfolios.length === 0 ? (
                    <Card className="items-center py-10">
                        <Text className="text-6xl mb-4">📊</Text>
                        <Text className="text-white text-xl font-bold text-center mb-2">
                            No Portfolio Connected
                        </Text>
                        <Text className="text-gray-400 text-center mb-6">
                            Connect your stock trading account to view your holdings
                        </Text>
                        <Button
                            title="Add Portfolio"
                            onPress={() => router.push('/portfolio/add-credentials')}
                            className="w-full"
                        />
                    </Card>
                ) : (
                    <>
                        {/* Summary Card */}
                        <Card className="mb-4">
                            <Text className="text-gray-400 text-sm">Total Value</Text>
                            <Text className="text-white text-3xl font-bold">
                                Rs.{totalValue.toLocaleString()}
                            </Text>
                            <View className="flex-row items-center mt-2">
                                <View className={`px-3 py-1 rounded-lg ${isProfit ? 'bg-green-900' : 'bg-red-900'}`}>
                                    <Text className={`font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                        {isProfit ? '+' : ''}Rs.{(Number(totalGain) || 0).toFixed(2)}
                                    </Text>
                                </View>
                                <Text className="text-gray-400 text-sm ml-2">
                                    Overall {isProfit ? 'Profit' : 'Loss'}
                                </Text>
                            </View>
                        </Card>

                        {/* Portfolio Distribution Pie Chart */}
                        {holdings.length > 0 && (
                            <Card className="mb-4 items-center">
                                <Text className="text-white text-lg font-bold mb-4 w-full">Asset Allocation</Text>
                                <PieChart
                                    data={holdings.map((h, i) => {
                                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
                                        const val = parseFloat(h.marketValue.toString()) || 0;
                                        const tot = parseFloat(totalValue.toString()) || 1;
                                        return {
                                            value: val,
                                            color: colors[i % colors.length],
                                            text: `${((val / tot) * 100).toFixed(0)}%`,
                                            textColor: '#fff',
                                            shiftTextX: -5,
                                        };
                                    })}
                                    donut
                                    showText
                                    textColor="#fff"
                                    radius={120}
                                    textSize={12}
                                    showTextBackground={false}
                                    centerLabelComponent={() => {
                                        const totVal = parseFloat(totalValue.toString()) || 0;
                                        return (
                                            <View className="items-center justify-center">
                                                <Text className="text-gray-400 text-xs text-center">Total</Text>
                                                <Text className="text-white text-sm font-bold text-center">
                                                    {(totVal / 1000).toFixed(1)}k
                                                </Text>
                                            </View>
                                        );
                                    }}
                                />
                                <View className="flex-row flex-wrap justify-center mt-4 gap-2">
                                    {holdings.map((h, i) => {
                                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
                                        const color = colors[i % colors.length];
                                        return (
                                            <View key={h.security} className="flex-row items-center mr-3 mb-2">
                                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 5 }} />
                                                <Text className="text-gray-400 text-xs">{h.security}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </Card>
                        )}

                        {/* Holdings */}
                        <Text className="text-white text-lg font-bold mb-3">Holdings ({holdings.length})</Text>
                        {loading ? (
                            <Card className="items-center py-10">
                                <Text className="text-gray-400">Loading holdings...</Text>
                            </Card>
                        ) : holdings.length === 0 ? (
                            <Card className="items-center py-10">
                                <Text className="text-gray-400">No holdings found</Text>
                            </Card>
                        ) : (
                            holdings.map((stock, index) => (
                                <StockCard key={`${stock.security}-${index}`} stock={stock} />
                            ))
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
