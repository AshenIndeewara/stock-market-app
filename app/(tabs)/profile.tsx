import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { uploadImageToR2 } from '../../services/uploadService';
import { useAuth } from '../../context/AuthContext';
import { clearStockSession } from '../../services/stockApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function ProfileScreen() {
    const { user, userProfile, logout, updateUserProfile } = useAuth();
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission needed', 'Please grant permission to access your photos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (imageUri: string) => {
        if (!user) return;

        setUploading(true);
        try {
            // Updated to use R2 upload with file URI
            const downloadURL = await uploadImageToR2(imageUri, user.uid);

            // Update auth profile
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { photoURL: downloadURL });
            }

            // Update Firestore profile
            await updateUserProfile({ photoURL: downloadURL });

            Alert.alert('Success', 'Profile image updated!');
        } catch (error: any) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', `Failed to upload image: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await clearStockSession();
                        await logout();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-4 pt-14 pb-4 bg-gray-800/50 border-b border-gray-700">
                <Text className="text-white text-2xl font-bold">Profile</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                {/* Profile Card */}
                <Card className="items-center py-6 mb-4">
                    <TouchableOpacity onPress={pickImage} disabled={uploading}>
                        <View className="relative">
                            {user?.photoURL || userProfile?.photoURL ? (
                                <Image
                                    source={{ uri: user?.photoURL || userProfile?.photoURL }}
                                    className="w-24 h-24 rounded-full"
                                />
                            ) : (
                                <View className="w-24 h-24 rounded-full bg-gray-700 items-center justify-center">
                                    <Text className="text-4xl">👤</Text>
                                </View>
                            )}
                            {uploading ? (
                                <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                                    <ActivityIndicator color="white" />
                                </View>
                            ) : (
                                <View className="absolute bottom-0 right-0 bg-blue-600 w-8 h-8 rounded-full items-center justify-center">
                                    <Text className="text-white">📷</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    <Text className="text-white text-xl font-bold mt-4">
                        {user?.displayName || userProfile?.displayName || 'User'}
                    </Text>
                    <Text className="text-gray-400">{user?.email}</Text>
                </Card>

                {/* Menu Items */}
                <Card className="mb-4">
                    <TouchableOpacity
                        className="flex-row items-center py-4 border-b border-gray-700"
                        onPress={() => router.push('/portfolio/add-credentials')}
                    >
                        <Text className="text-2xl mr-4">🔐</Text>
                        <View className="flex-1">
                            <Text className="text-white font-medium">Stock Portfolio Login</Text>
                            <Text className="text-gray-400 text-sm">Manage your trading account credentials</Text>
                        </View>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-4 border-b border-gray-700"
                        onPress={() => router.push('/portfolio/manage')}
                    >
                        <Text className="text-2xl mr-4">📊</Text>
                        <View className="flex-1">
                            <Text className="text-white font-medium">Manage Portfolios</Text>
                            <Text className="text-gray-400 text-sm">Add, edit or switch between portfolios</Text>
                        </View>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center py-4">
                        <Text className="text-2xl mr-4">⚙️</Text>
                        <View className="flex-1">
                            <Text className="text-white font-medium">Settings</Text>
                            <Text className="text-gray-400 text-sm">App preferences and notifications</Text>
                        </View>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>
                </Card>

                {/* Logout */}
                <Button
                    title="Logout"
                    variant="danger"
                    onPress={handleLogout}
                />

                {/* App Version */}
                <Text className="text-gray-500 text-center mt-6 text-sm">
                    Stock Portfolio Manager v1.0.0
                </Text>
            </ScrollView>
        </View>
    );
}
