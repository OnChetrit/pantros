import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { appColors, useThemedStyles } from '@/lib/theme';
import type { PantryListSortOption } from '@/features/pantry/pantry-sort/pantry-sort-options';

type PantryFilterMenuProps = {
  sortOption?: PantryListSortOption;
  sheetHref: '/cart/sort' | '/pantry/sort';
  hideTrigger?: boolean;
};

export function PantryFilterMenu({sortOption, sheetHref, hideTrigger = false}: PantryFilterMenuProps) {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();

  return (
    <View style={hideTrigger ? undefined : styles.iconWrapper}>
      {hideTrigger ? null : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open sort menu"
          onPress={() =>
            router.push({
              pathname: sheetHref,
              params: {sort: sortOption},
            })
          }
          style={({pressed}) => [
            styles.iconTrigger,
            pressed ? styles.triggerPressed : null,
          ]}
        >
          <Ionicons name="swap-vertical-outline" size={20} color={appColors.tint} />
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    iconWrapper: {
      alignSelf: 'center',
      backgroundColor: 'transparent',
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
      // backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
