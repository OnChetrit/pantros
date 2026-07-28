import { usePathname } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { StyleSheet, Text, View } from 'react-native';

import { AddItemDestinationPicker } from '@/features/items/add-item-destination-picker/add-item-destination-picker';
import { useAppTheme } from '@/lib/theme';
import { useAddItemDestination } from '@/state/add-item-destination-state';
import { useWorkspaceState } from '@/state/workspace-state';

export function AddItemDestinationAccessory() {
  const placement = NativeTabs.BottomAccessory.usePlacement();
  const pathname = usePathname();
  const {colors} = useAppTheme();
  const {destination, ready, setDestination} = useAddItemDestination();
  const {selectedPantry} = useWorkspaceState();

  if (pathname.includes('/cart') || !selectedPantry) {
    return null;
  }

  if (placement === 'inline') {
    return <AddItemDestinationPicker value={destination} disabled={!ready} onChange={setDestination} />;
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.card, borderColor: colors.border}]}>
      <Text style={[styles.label, {color: colors.muted}]}>New items</Text>
      <AddItemDestinationPicker
        value={destination}
        disabled={!ready}
        onChange={setDestination}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
});
