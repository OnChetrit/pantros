import { Redirect } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function TabsLayout() {
  const {isAuthenticated, status} = useAppContext();
  const {colors} = useAppTheme();

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      backgroundColor={colors.card}
      blurEffect="none"
      disableTransparentOnScrollEdge
      shadowColor={colors.border}
      tintColor={colors.tint}
      labelStyle={{
        default: {
          color: colors.muted,
          fontWeight: '600',
        },
        selected: {
          color: colors.tint,
          fontWeight: '700',
        },
      }}
    >
      <NativeTabs.Trigger
        name="pantry"
        contentStyle={{ backgroundColor: colors.background }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Icon sf="refrigerator.fill" />
        <NativeTabs.Trigger.Label>Pantry</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="cart"
        contentStyle={{ backgroundColor: colors.background }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Icon sf="cart.fill" />
        <NativeTabs.Trigger.Label>Cart</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="search"
        role="search"
        contentStyle={{ backgroundColor: colors.background }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Icon sf="magnifyingglass" />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
