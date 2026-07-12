import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { StyleSheet, View } from 'react-native';

import { appColors } from '@/components/ui/primitives';
import { useAppTheme } from '@/lib/theme';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.background,
  },
});

export function TabsLayoutContent() {
  const {colors} = useAppTheme();

  return (
    <View style={styles.root}>
      <NativeTabs
        backgroundColor={colors.card}
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
        <NativeTabs.Trigger name="pantry">
          <NativeTabs.Trigger.Icon sf="house.fill" />
          <NativeTabs.Trigger.Label>Pantry</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="cart">
          <NativeTabs.Trigger.Icon sf="cart.fill" />
          <NativeTabs.Trigger.Label>Cart</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="search" role="search">
          <NativeTabs.Trigger.Icon
            sf={{
              default: 'plus.magnifyingglass',
              selected: 'plus.magnifyingglass',
            }}
          />
          <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}

export default TabsLayoutContent;
