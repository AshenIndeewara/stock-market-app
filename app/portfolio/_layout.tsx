import { Stack } from 'expo-router';

export default function PortfolioLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#1F2937' },
                headerTintColor: '#fff',
                contentStyle: { backgroundColor: '#111827' },
            }}
        />
    );
}
