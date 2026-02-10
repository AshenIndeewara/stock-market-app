import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PortfolioCredentials } from '../../types';

export default function ManagePortfoliosScreen() {
    const { user } = useAuth();
    const [portfolios, setPortfolios] = useState<PortfolioCredentials[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPortfolios = useCallback(async () => {
        if (!user) return;

        try {
            const q = query(
                collection(db, 'portfolios'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(q);
            const portfolioList: PortfolioCredentials[] = [];

            snapshot.forEach((doc) => {
                portfolioList.push({ id: doc.id, ...doc.data() } as PortfolioCredentials);
            });

            setPortfolios(portfolioList);
        } catch (error) {
            console.error('Error loading portfolios:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadPortfolios();
    }, [loadPortfolios]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPortfolios();
        setRefreshing(false);
    };

    const setActive = async (portfolio: PortfolioCredentials) => {
        if (!user) return;

        try {
            // Deactivate all
            for (const p of portfolios) {
                if (p.isActive) {
                    await updateDoc(doc(db, 'portfolios', p.id), { isActive: false });
                }
            }

            // Activate selected
            await updateDoc(doc(db, 'portfolios', portfolio.id), { isActive: true });
            await loadPortfolios();
            Alert.alert('Success', `${portfolio.portfolioName} is now active`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update portfolio');
        }
    };

    const deletePortfolio = (portfolio: PortfolioCredentials) => {
        Alert.alert(
            'Delete Portfolio',
            `Are you sure you want to delete "${portfolio.portfolioName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'portfolios', portfolio.id));
                            await loadPortfolios();
                            Alert.alert('Deleted', 'Portfolio has been removed');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete portfolio');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-900">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
                }
            >
                {/* Add New Button */}
                <Button
                    title="+ Add New Portfolio"
                    onPress={() => router.push('/portfolio/add-credentials')}
                    className="mb-4"
                />

                {loading ? (
                    <Card className="items-center py-10">
                        <Text className="text-gray-400">Loading portfolios...</Text>
                    </Card>
                ) : portfolios.length === 0 ? (
                    <Card className="items-center py-10">
                        <Text className="text-6xl mb-4">📊</Text>
                        <Text className="text-white text-xl font-bold text-center mb-2">
                            No Portfolios Yet
                        </Text>
                        <Text className="text-gray-400 text-center">
                            Add your first stock portfolio to get started
                        </Text>
                    </Card>
                ) : (
                    <>
                        <Text className="text-white text-lg font-bold mb-3">
                            Your Portfolios ({portfolios.length})
                        </Text>

                        {portfolios.map((portfolio) => (
                            <Card key={portfolio.id} className="mb-3">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <View className="flex-row items-center">
                                            <Text className="text-white text-lg font-bold">
                                                {portfolio.portfolioName}
                                            </Text>
                                            {portfolio.isActive && (
                                                <View className="ml-2 bg-green-600 px-2 py-0.5 rounded">
                                                    <Text className="text-white text-xs">Active</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text className="text-gray-400 text-sm mt-1">
                                            {portfolio.clientAccount}
                                        </Text>
                                        <Text className="text-gray-500 text-xs mt-1">
                                            {portfolio.exchange} • {portfolio.broker}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row mt-4 pt-4 border-t border-gray-700">
                                    <TouchableOpacity
                                        className="flex-1 bg-gray-600 rounded-lg py-2 mr-2"
                                        onPress={() => router.push({ pathname: '/portfolio/[id]', params: { id: portfolio.id } })}
                                    >
                                        <Text className="text-white text-center font-medium">Edit</Text>
                                    </TouchableOpacity>
                                    {!portfolio.isActive && (
                                        <TouchableOpacity
                                            className="flex-1 bg-blue-600 rounded-lg py-2 mr-2"
                                            onPress={() => setActive(portfolio)}
                                        >
                                            <Text className="text-white text-center font-medium">Set Active</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        className="bg-red-600/20 border border-red-600 rounded-lg py-2 px-4"
                                        onPress={() => deletePortfolio(portfolio)}
                                    >
                                        <Text className="text-red-400 text-center font-medium">Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
