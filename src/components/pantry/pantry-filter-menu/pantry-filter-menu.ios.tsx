import { BottomSheet, Button, Host, ListItem, Text } from '@expo/ui';
import { List, Section } from '@expo/ui/swift-ui';
import {
  background,
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  font,
  foregroundStyle,
  frame,
  listStyle,
  listRowBackground,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SHEET_HORIZONTAL_PADDING, createBottomSheetModifiers } from '@/components/sheets/sheet-presets/sheet-presets';
import { appColors, useThemedStyles } from '@/lib/theme';

export type PantryListSortOption = 'expiration' | 'name' | 'recent';

type SortOption = {
  key: PantryListSortOption;
  label: string;
};

const SORT_OPTIONS: SortOption[] = [
  {key: 'expiration', label: 'Soonest Expiration'},
  {key: 'name', label: 'Name A-Z'},
  {key: 'recent', label: 'Recently Added'},
];

type PantryFilterMenuProps = {
  sortOption?: PantryListSortOption;
  onSelectSort?: (option: PantryListSortOption) => void;
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  hideTrigger?: boolean;
};

export function PantryFilterMenu({
  sortOption,
  onSelectSort,
  visible,
  onVisibilityChange,
  hideTrigger = false,
}: PantryFilterMenuProps) {
  const styles = useThemedStyles(createStyles);
  const [uncontrolledVisible, setUncontrolledVisible] = useState(false);
  const [draftSortOption, setDraftSortOption] = useState<PantryListSortOption>(sortOption ?? 'expiration');
  const isMenuVisible = visible ?? uncontrolledVisible;

  const setMenuVisible = useCallback(
    (nextVisible: boolean) => {
      if (visible === undefined) {
        setUncontrolledVisible(nextVisible);
      }

      onVisibilityChange?.(nextVisible);
    },
    [onVisibilityChange, visible]
  );

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleSelectSort = (option: PantryListSortOption) => {
    setDraftSortOption(option);
    onSelectSort?.(option);
    setTimeout(closeMenu, 140);
  };

  const handleDismiss = useCallback(() => {
    setMenuVisible(false);
  }, [setMenuVisible]);

  return (
    <View style={hideTrigger ? undefined : styles.iconWrapper}>
      {hideTrigger ? null : (
        <Host matchContents>
          <Button
            label="Sort"
            onPress={() => {
              setDraftSortOption(sortOption ?? 'expiration');
              setMenuVisible(true);
            }}
            modifiers={[
              disabled(!onSelectSort),
              controlSize('regular'),
              buttonStyle('glass'),
              buttonBorderShape('capsule'),
            ]}
          />
        </Host>
      )}
      <BottomSheet
        isPresented={isMenuVisible}
        onDismiss={handleDismiss}
        snapPoints={[{height: 320}]}
        modifiers={createBottomSheetModifiers(320)}
      >
        <Host style={styles.host}>
          <List modifiers={[listStyle('inset'), listRowBackground('clear')]}>
            <Section title="Sort">
              {SORT_OPTIONS.map(option => {
                const isSelected = option.key === draftSortOption;

                return (
                  <ListItem
                    key={option.key}
                    onPress={() => handleSelectSort(option.key)}
                    leading={
                      <Text
                        modifiers={[
                          font({weight: 'bold', size: 13}),
                          foregroundStyle(isSelected ? appColors.textInverse : 'secondaryLabel'),
                          frame({width: 28, height: 28}),
                          background(isSelected ? appColors.tint : '#F1F2F4', shapes.circle()),
                        ]}
                      >
                        {isSelected ? '✓' : ''}
                      </Text>
                    }
                  >
                    <Text modifiers={[font({weight: isSelected ? 'semibold' : 'regular', size: 17})]}>
                      {option.label}
                    </Text>
                  </ListItem>
                );
              })}
            </Section>
          </List>
        </Host>
      </BottomSheet>
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    host: {
      flex: 1,
      marginHorizontal: -SHEET_HORIZONTAL_PADDING,
      backgroundColor: 'transparent',
    },
    iconWrapper: {
      alignSelf: 'center',
      backgroundColor: 'transparent',
    },
  });
