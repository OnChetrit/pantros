import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AccountMenuContent } from '@/components/navigation/account-menu-content';
import { appColors, useAppTheme } from '@/lib/theme';

export default function AccountMenuScreen() {
  const router = useRouter();
  const {colors} = useAppTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          presentation: 'modal',
          headerBackVisible: true,
          headerShadowVisible: true,
          headerTransparent: Platform.OS === 'ios',
          headerBackground: Platform.OS === 'ios' ? () => <View style={StyleSheet.absoluteFillObject} /> : undefined,
          headerStyle: {
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background,
          },
          headerRight: () => (
            <Pressable accessibilityLabel="Close account menu" onPress={() => router.back()}>
              <Ionicons
                name="close"
                size={Platform.OS === 'ios' ? 30 : 22}
                color={Platform.OS === 'ios' ? appColors.muted : colors.text}
              />
            </Pressable>
          ),
        }}
      />
      <AccountMenuContent />
    </>
  );
}

const styles = StyleSheet.create({
  closeButtonPressed: {
    opacity: 0.76,
  },
});
