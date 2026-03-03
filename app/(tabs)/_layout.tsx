import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '@/lib/design-system';
import { useTheme } from '@/lib/ThemeContext';
import { useSubscription } from '@/lib/useSubscription';
import { AdBanner, AD_BANNER_HEIGHT } from '@/components/ui';

/** Task-management Figma style: clean tab bar, brand purple active */
const TAB_ICONS: Record<string, string> = {
  capture: '📥',
  calendar: '📅',
  notes: '📝',
  review: '📊',
  profile: '👤',
};

function CustomTabBar(props: BottomTabBarProps) {
  const { isPro } = useSubscription();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;
  const totalHeight = tabBarHeight + (isPro ? 0 : AD_BANNER_HEIGHT);
  const bgColor = isDark ? colors.surface.card : colors.surface.cardLight;

  return (
    <View
      style={{
        height: totalHeight,
        backgroundColor: bgColor,
        borderTopWidth: 1,
        borderTopColor: isDark ? colors.border.subtle : colors.border.subtleLight,
      }}
    >
      {!isPro && <AdBanner />}
      <View style={{ height: tabBarHeight, paddingTop: 12, justifyContent: 'flex-end' }}>
        <BottomTabBar {...props} />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const tabBarHeight = 56 + insets.bottom;
  const { isPro } = useSubscription();
  const isDark = theme === 'dark';
  const totalBarHeight = tabBarHeight + (isPro ? 0 : AD_BANNER_HEIGHT);

  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: isDark ? colors.text.secondary : colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: isDark ? colors.surface.card : colors.surface.cardLight,
          borderTopWidth: 1,
          borderTopColor: isDark ? colors.border.subtle : colors.border.subtleLight,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          paddingTop: 12,
          height: totalBarHeight,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Text style={{ color, fontSize: 22 }}>{TAB_ICONS.capture}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen name="inbox" options={{ href: null }} />
      <Tabs.Screen name="schedule" options={{ href: null }} />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Text style={{ color, fontSize: 22 }}>{TAB_ICONS.calendar}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Text style={{ color, fontSize: 22 }}>{TAB_ICONS.notes}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Text style={{ color, fontSize: 22 }}>{TAB_ICONS.review}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Text style={{ color, fontSize: 22 }}>{TAB_ICONS.profile}</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
