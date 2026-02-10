import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Index() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View className="flex-1 bg-gray-900 items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/(auth)/login" />;
}
