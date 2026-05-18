import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { appColors } from '@/lib/theme';

export type PantryListSortOption = 'expiration' | 'name' | 'recent';

type SortOption = {
  key: PantryListSortOption;
  label: string;
};

const SORT_OPTIONS: SortOption[] = [
  { key: 'expiration', label: 'Soonest Expiration' },
  { key: 'name', label: 'Name A-Z' },
  { key: 'recent', label: 'Recently Added' },
];

type PantryFilterMenuProps = {
  sortOption?: PantryListSortOption;
  onSelectSort?: (option: PantryListSortOption) => void;
};

export function PantryFilterMenu({
  sortOption,
  onSelectSort,
}: PantryFilterMenuProps) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [pendingSortOption, setPendingSortOption] = useState<PantryListSortOption | null>(null);

  const closeMenu = () => {
    setIsMenuVisible(false);
  };

  const handleSelectSort = (option: PantryListSortOption) => {
    setPendingSortOption(option);
    closeMenu();
  };

  const handleDismiss = useCallback(() => {
    if (!pendingSortOption) {
      return;
    }

    onSelectSort?.(pendingSortOption);
    setPendingSortOption(null);
  }, [onSelectSort, pendingSortOption]);

  return (
    <View style={styles.iconWrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open sort menu"
        disabled={!onSelectSort}
        onPress={() => setIsMenuVisible(true)}
        style={({ pressed }) => [styles.iconTrigger, pressed ? styles.triggerPressed : null, !onSelectSort ? styles.triggerDisabled : null]}
      >
        <Ionicons name="swap-vertical-outline" size={20} color={appColors.tint} />
      </Pressable>

      <BottomSheetModal visible={isMenuVisible} onClose={closeMenu} onDismiss={handleDismiss} sheetStyle={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Sort</Text>
        </View>

        <View style={styles.optionList}>
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.key === sortOption;

            return (
              <Pressable
                key={option.key}
                onPress={() => handleSelectSort(option.key)}
                style={({ pressed }) => [
                  styles.optionRow,
                  isSelected ? styles.optionRowSelected : null,
                  pressed ? styles.optionRowPressed : null,
                ]}
              >
                <View style={[styles.optionMarker, isSelected ? styles.optionMarkerSelected : null]}>
                  {isSelected ? <Ionicons name="checkmark" size={16} color={appColors.textInverse} /> : null}
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  triggerPressed: {
    opacity: 0.8,
  },
  triggerDisabled: {
    opacity: 0.45,
  },
  iconTrigger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  sheet: {
    gap: 14,
  },
  sheetHeader: {
    paddingHorizontal: 2,
  },
  sheetTitle: {
    color: appColors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  optionList: {
    gap: 10,
  },
  optionRow: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionRowSelected: {
    backgroundColor: appColors.tintSoft,
    borderColor: appColors.borderStrong,
  },
  optionRowPressed: {
    opacity: 0.78,
  },
  optionMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: appColors.borderStrong,
    backgroundColor: appColors.listRowEmphasized,
  },
  optionMarkerSelected: {
    backgroundColor: appColors.tint,
    borderColor: appColors.tint,
  },
  optionLabel: {
    flex: 1,
    color: appColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
