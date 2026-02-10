import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function RegisterScreen() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        if (!displayName || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await register(email, password, displayName);
            router.replace('/(tabs)');
        } catch (err: any) {
            setError(err.message || 'Failed to register');
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
                    {/* Header */}
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-4">
                            <Text className="text-white text-3xl font-bold">📈</Text>
                        </View>
                        <Text className="text-white text-3xl font-bold">Create Account</Text>
                        <Text className="text-gray-400 text-base mt-2">Start managing your portfolio</Text>
                    </View>

                    {/* Form */}
                    <View className="bg-gray-800/50 rounded-3xl p-6 border border-gray-700">
                        {error ? (
                            <View className="bg-red-900/50 border border-red-500 rounded-xl p-3 mb-4">
                                <Text className="text-red-400 text-center">{error}</Text>
                            </View>
                        ) : null}

                        <Input
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={displayName}
                            onChangeText={setDisplayName}
                            autoCapitalize="words"
                        />

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
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            className="mt-4"
                        />

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-gray-400">Already have an account? </Text>
                            <Link href="/(auth)/login" asChild>
                                <Text className="text-blue-400 font-semibold">Sign In</Text>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
