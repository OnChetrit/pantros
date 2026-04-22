import { Ionicons } from '@expo/vector-icons';
import { Button, Host, Menu, Section } from '@expo/ui/swift-ui';
import type { Pantry } from '@/domain/models';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

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
  eyebrowLabel?: string;
  pantries: Pantry[];
  selectedPantryId: string | null;
  selectedPantryName: string;
  itemCount: number;
  sortOption?: PantryListSortOption;
  onSelectPantry: (pantryId: string) => void;
  onSelectSort?: (option: PantryListSortOption) => void;
  variant?: 'card' | 'icon';
};

export function PantryFilterMenu({
  eyebrowLabel = 'Viewing Pantry',
  pantries,
  selectedPantryId,
  selectedPantryName,
  itemCount,
  sortOption,
  onSelectPantry,
  onSelectSort,
  variant = 'card',
}: PantryFilterMenuProps) {
  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;
  const selectedSortLabel = SORT_OPTIONS.find((option) => option.key === sortOption)?.label;
  const subtitle = selectedSortLabel ? `${itemLabel} · ${selectedSortLabel}` : itemLabel;
  const renderTrigger = () =>
    variant === 'icon' ? (
      <View style={styles.iconTrigger}>
        <Ionicons name="funnel-outline" size={20} color={appColors.tint} />
      </View>
    ) : (
      <View style={styles.trigger}>
        <View style={styles.triggerCopy}>
          <Text style={styles.triggerTitle}>{selectedPantryName}</Text>
          <Text style={styles.triggerSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.chevron}>􀆈</Text>
      </View>
    );

  const openFallbackMenu = () => {
    Alert.alert(
      'Sort & Filter',
      undefined,
      [
        ...(onSelectSort
          ? SORT_OPTIONS.map((option) => ({
              text: option.key === sortOption ? `✓ ${option.label}` : option.label,
              onPress: () => onSelectSort(option.key),
            }))
          : []),
        ...pantries.map((pantry) => ({
          text: pantry.id === selectedPantryId ? `✓ ${pantry.name}` : pantry.name,
          onPress: () => onSelectPantry(pantry.id),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
      { cancelable: true }
    );
  };

  if (Platform.OS === 'ios' && variant !== 'icon') {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.eyebrow}>{eyebrowLabel}</Text>
        <Host matchContents useViewportSizeMeasurement style={styles.host}>
          <Menu label={renderTrigger()}>
            {onSelectSort ? (
              <Section title="Sort">
                {SORT_OPTIONS.map((option) => (
                  <Button
                    key={option.key}
                    label={option.key === sortOption ? `✓ ${option.label}` : option.label}
                    onPress={() => onSelectSort(option.key)}
                  />
                ))}
              </Section>
            ) : null}
            <Section title="Pantries">
              {pantries.map((pantry) => (
                <Button
                  key={pantry.id}
                  label={pantry.id === selectedPantryId ? `✓ ${pantry.name}` : pantry.name}
                  onPress={() => onSelectPantry(pantry.id)}
                />
              ))}
            </Section>
          </Menu>
        </Host>
      </View>
    );
  }

  return (
    <View style={variant === 'icon' ? styles.iconWrapper : styles.wrapper}>
      {variant === 'card' ? <Text style={styles.eyebrow}>{eyebrowLabel}</Text> : null}
      <Pressable
        onPress={openFallbackMenu}
        style={({ pressed }) => [
          variant === 'icon' ? styles.iconTrigger : styles.trigger,
          pressed ? styles.triggerPressed : null,
        ]}
      >
        {variant === 'icon' ? (
          <Ionicons name="funnel-outline" size={20} color={appColors.tint} />
        ) : (
          <>
            <View style={styles.triggerCopy}>
              <Text style={styles.triggerTitle}>{selectedPantryName}</Text>
              <Text style={styles.triggerSubtitle}>{subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 8,
  },
  iconWrapper: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: appColors.muted,
  },
  host: {
    alignSelf: 'stretch',
  },
  trigger: {
    minHeight: 56,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  triggerPressed: {
    opacity: 0.8,
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
  triggerCopy: {
    flex: 1,
    gap: 2,
  },
  triggerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: appColors.text,
  },
  triggerSubtitle: {
    fontSize: 13,
    color: appColors.muted,
  },
  chevron: {
    fontSize: 16,
    color: appColors.muted,
  },
});
