import { Button, Host } from '@expo/ui';
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
} from '@expo/ui/swift-ui/modifiers';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';
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
        <Host matchContents>
          <Button
            label="Sort"
            onPress={() =>
              router.push({
                pathname: sheetHref,
                params: {sort: sortOption},
              })
            }
            modifiers={[
              controlSize('regular'),
              buttonStyle('glass'),
              buttonBorderShape('capsule'),
            ]}
          />
        </Host>
      )}
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    iconWrapper: {
      alignSelf: 'center',
      backgroundColor: 'transparent',
    },
  });
