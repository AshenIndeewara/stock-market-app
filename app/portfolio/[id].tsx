import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { loginToStockApi } from '../../services/stockApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PortfolioCredentials } from '../../types';

export default function EditPortfolioScreen() {
    const { user } = useAuth();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [portfolio, setPortfolio] = useState<PortfolioCredentials | null>(null);
    const [portfolioName, setPortfolioName] = useState('');
    const [clientAccount, setClientAccount] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPortfolio();
    }, [id]);

    const loadPortfolio = async () => {
        if (!id) {
            router.back();
            return;
        }

        try {
            const docRef = doc(db, 'portfolios', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as PortfolioCredentials;
                setPortfolio(data);
                setPortfolioName(data.portfolioName);
                setClientAccount(data.clientAccount);
                setUsername(data.username);
                setPassword(data.password);
            } else {
                Alert.alert('Error', 'Portfolio not found');
                router.back();
            }
        } catch (error) {
            console.error('Error loading portfolio:', error);
            Alert.alert('Error', 'Failed to load portfolio');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!portfolioName || !clientAccount) {
            setError('Please fill in all required fields');
            return;
        }

        if (!id) return;

        setSaving(true);
        setError('');

        try {
            // If credentials changed, verify they work
            if (username && password && (username !== portfolio?.username || password !== portfolio?.password)) {
                try {
                    await loginToStockApi(username, password);
                } catch (err: any) {
                    setError('Invalid credentials: ' + (err.message || 'Login failed'));
                    setSaving(false);
                    return;
                }
            }

            // Update portfolio in Firestore
            await updateDoc(doc(db, 'portfolios', id), {
                portfolioName,
                clientAccount,
                username,
                password,
                updatedAt: serverTimestamp(),
            });

            Alert.alert('Success', 'Portfolio updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err: any) {
            setError(err.message || 'Failed to save portfolio');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-900 items-center justify-center">
                <Text className="text-gray-400">Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            <ScrollView
                className="flex-1 bg-gray-900"
                contentContainerStyle={{ padding: 16 }}
                keyboardShouldPersistTaps="handled"
            >
                <Card>
                    <Text className="text-white text-xl font-bold mb-6">Edit Portfolio</Text>

                    {error ? (
                        <View className="bg-red-900/50 border border-red-500 rounded-xl p-3 mb-4">
                            <Text className="text-red-400 text-center">{error}</Text>
                        </View>
                    ) : null}

                    <Input
                        label="Portfolio Name"
                        placeholder="e.g., Main Portfolio"
                        value={portfolioName}
                        onChangeText={setPortfolioName}
                    />

                    <Input
                        label="Client Account"
                        placeholder="e.g., DSA/119628-LI/0 (Your Name)"
                        value={clientAccount}
                        onChangeText={setClientAccount}
                        autoCapitalize="none"
                    />

                    <View className="bg-gray-700/50 rounded-xl p-4 mb-4">
                        <Text className="text-gray-300 text-sm">
                            The client account format is usually: <Text className="text-white font-mono">BROKER/ID/NUMBER (NAME)</Text>
                        </Text>
                    </View>

                    <Text className="text-white text-lg font-semibold mb-3 mt-4">Login Credentials</Text>
                    <Text className="text-gray-400 text-sm mb-4">
                        Update your trading account credentials (leave unchanged if not updating)
                    </Text>

                    <Input
                        label="Username"
                        placeholder="Trading username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        placeholder="Trading password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Button
                        title="Save Changes"
                        onPress={handleSave}
                        loading={saving}
                        className="mt-4"
                    />

                    <Button
                        title="Cancel"
                        variant="secondary"
                        onPress={() => router.back()}
                        className="mt-3"
                    />
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
