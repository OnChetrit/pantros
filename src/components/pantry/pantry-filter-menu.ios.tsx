import { BottomSheet, ListItem } from '@expo/ui';
import { Host, List, Section, Text } from '@expo/ui/swift-ui';
import {
  background,
  font,
  foregroundStyle,
  frame,
  listStyle,
  listRowBackground,
  padding,
  presentationBackground,
  presentationDragIndicator,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text as RNText, StyleSheet, View } from 'react-native';

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

  useEffect(() => {
    if (!isMenuVisible) {
      setDraftSortOption(sortOption ?? 'expiration');
    }
  }, [isMenuVisible, sortOption]);

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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open sort menu"
          disabled={!onSelectSort}
          onPress={() => setMenuVisible(true)}
          style={({pressed}) => [
            styles.iconTrigger,
            pressed ? styles.triggerPressed : null,
            !onSelectSort ? styles.triggerDisabled : null,
          ]}
        >
          <RNText style={styles.triggerGlyph}>⇅</RNText>
        </Pressable>
      )}
      <BottomSheet
        isPresented={isMenuVisible}
        onDismiss={handleDismiss}
        snapPoints={[{height: 320}]}
        modifiers={[
          padding({top: 8, leading: 0, trailing: 0, bottom: 20}),
          presentationBackground('clear'),
          presentationDragIndicator('visible'),
        ]}
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
      backgroundColor: 'transparent',
    },
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
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    triggerGlyph: {
      color: appColors.tint,
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 20,
    },
  });
