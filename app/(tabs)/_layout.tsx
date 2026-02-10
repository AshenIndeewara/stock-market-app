import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
    const icons: { [key: string]: string } = {
        portfolio: '📊',
        market: '📈',
        sectors: '🏢',
        profile: '👤',
    };

    return (
        <View className="items-center">
            <Text className="text-2xl">{icons[name]}</Text>
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1F2937',
                    borderTopColor: '#374151',
                    borderTopWidth: 1,
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 70,
                },
                tabBarActiveTintColor: '#3B82F6',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Portfolio',
                    tabBarIcon: ({ focused }) => <TabIcon name="portfolio" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="market"
                options={{
                    title: 'Market',
                    tabBarIcon: ({ focused }) => <TabIcon name="market" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="sectors"
                options={{
                    title: 'Sectors',
                    tabBarIcon: ({ focused }) => <TabIcon name="sectors" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
                }}
            />
        </Tabs>
    );
}

