import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { View } from 'react-native';

export default function RootLayout() {
    return (
        <AuthProvider>
            <View className="flex-1 bg-gray-900">
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#111827' },
                    }}
                />
            </View>
        </AuthProvider>
    );
}
