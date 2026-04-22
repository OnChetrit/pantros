import { useAppTheme } from '@/lib/theme';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const {colors} = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerStyle: {backgroundColor: colors.background},
        headerTintColor: colors.tint,
        headerTitleStyle: {color: colors.text},
        contentStyle: {backgroundColor: colors.background},
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
