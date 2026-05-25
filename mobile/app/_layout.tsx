import { Stack } from 'expo-router';

export default function RootLayout(): JSX.Element {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ presentation: 'modal', title: 'Sign in' }} />
      <Stack.Screen name="create-listing" options={{ presentation: 'modal', title: 'New listing' }} />
      <Stack.Screen name="order/[id]" options={{ title: 'Order' }} />
      <Stack.Screen name="zones" options={{ title: 'Demand zones' }} />
    </Stack>
  );
}
