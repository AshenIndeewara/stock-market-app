import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { loginToStockApi } from '../../services/stockApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function AddCredentialsScreen() {
    const { user } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [portfolioName, setPortfolioName] = useState('');
    const [clientAccount, setClientAccount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'credentials' | 'portfolio'>('credentials');
    const [sessionVerified, setSessionVerified] = useState(false);

    const handleVerifyLogin = async () => {
        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const session = await loginToStockApi(username, password);
            setSessionVerified(true);
            setStep('portfolio');
            Alert.alert('Success', 'Stock account verified successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to login to stock account');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePortfolio = async () => {
        if (!portfolioName || !clientAccount) {
            setError('Please fill in all fields');
            return;
        }

        if (!user) {
            setError('User not logged in');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Add portfolio to Firestore
            await addDoc(collection(db, 'portfolios'), {
                userId: user.uid,
                username,
                password, // Note: Consider encrypting this
                portfolioName,
                clientAccount,
                exchange: 'CSE',
                broker: 'DSA',
                isActive: true,
                createdAt: serverTimestamp(),
            });

            Alert.alert('Success', 'Portfolio added successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err: any) {
            setError(err.message || 'Failed to save portfolio');
        } finally {
            setLoading(false);
        }
    };

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
                {/* Info Card */}
                <Card className="mb-4 bg-blue-900/30 border-blue-700">
                    <View className="flex-row items-start">
                        <Text className="text-2xl mr-3">ℹ️</Text>
                        <View className="flex-1">
                            <Text className="text-blue-300 font-medium">Stock Trading Account</Text>
                            <Text className="text-blue-200 text-sm mt-1">
                                Enter your stock trading platform credentials to access your portfolio data.
                                This uses the CTS trading system.
                            </Text>
                        </View>
                    </View>
                </Card>

                {step === 'credentials' ? (
                    <Card>
                        <Text className="text-white text-xl font-bold mb-6">Step 1: Verify Account</Text>

                        {error ? (
                            <View className="bg-red-900/50 border border-red-500 rounded-xl p-3 mb-4">
                                <Text className="text-red-400 text-center">{error}</Text>
                            </View>
                        ) : null}

                        <Input
                            label="Username"
                            placeholder="Enter your trading username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your trading password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Button
                            title="Verify & Continue"
                            onPress={handleVerifyLogin}
                            loading={loading}
                            className="mt-4"
                        />
                    </Card>
                ) : (
                    <Card>
                        <Text className="text-white text-xl font-bold mb-2">Step 2: Portfolio Details</Text>
                        <Text className="text-green-400 text-sm mb-6">✓ Account verified successfully</Text>

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

                        <Button
                            title="Save Portfolio"
                            onPress={handleSavePortfolio}
                            loading={loading}
                            className="mt-2"
                        />

                        <Button
                            title="Back"
                            variant="secondary"
                            onPress={() => setStep('credentials')}
                            className="mt-3"
                        />
                    </Card>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
