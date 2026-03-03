import { Stack } from 'expo-router';

/** Calendar tab: list (index) + full-screen edit (edit/[id]) to avoid overlay */
export default function CalendarLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="edit/[id]"
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
