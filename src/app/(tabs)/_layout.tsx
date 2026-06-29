import { Redirect } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { StyleSheet, View } from 'react-native';

import { appColors } from '@/components/ui/primitives';
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
    <View style={styles.root}>
      <NativeTabs
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
          contentStyle={{backgroundColor: colors.background}}
          disableTransparentOnScrollEdge
        >
          <NativeTabs.Trigger.Icon sf="house.fill" />
          <NativeTabs.Trigger.Label>Pantry</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="cart"
          contentStyle={{backgroundColor: colors.background}}
          disableTransparentOnScrollEdge
        >
          <NativeTabs.Trigger.Icon sf="cart.fill" />
          <NativeTabs.Trigger.Label>Cart</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="search"
          role="search"
          contentStyle={{backgroundColor: colors.background}}
          disableTransparentOnScrollEdge
        >
          <NativeTabs.Trigger.Icon
            sf={{
              default: 'plus.magnifyingglass',
              selected: 'plus.magnifyingglass',
            }}
          />
          <NativeTabs.Trigger.Label hidden>Search + Add</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.background,
  },
});
