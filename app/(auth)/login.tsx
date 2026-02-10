import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await login(email, password);
            router.replace('/(tabs)');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
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
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 px-6 justify-center py-12">
                    {/* Logo/Header */}
                    <View className="items-center mb-10">
                        <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-4">
                            <Text className="text-white text-3xl font-bold">📈</Text>
                        </View>
                        <Text className="text-white text-3xl font-bold">Stock Portfolio</Text>
                        <Text className="text-gray-400 text-base mt-2">Manage your investments</Text>
                    </View>

                    {/* Form */}
                    <View className="bg-gray-800/50 rounded-3xl p-6 border border-gray-700">
                        <Text className="text-white text-2xl font-bold mb-6">Welcome Back</Text>

                        {error ? (
                            <View className="bg-red-900/50 border border-red-500 rounded-xl p-3 mb-4">
                                <Text className="text-red-400 text-center">{error}</Text>
                            </View>
                        ) : null}

                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            className="mt-4"
                        />

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-gray-400">Don't have an account? </Text>
                            <Link href="/(auth)/register" asChild>
                                <Text className="text-blue-400 font-semibold">Sign Up</Text>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
