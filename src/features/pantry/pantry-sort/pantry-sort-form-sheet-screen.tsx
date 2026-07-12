import { ListItem } from '@expo/ui';
import { Host, List, Section, Text } from '@expo/ui/swift-ui';
import { background, font, foregroundStyle, frame, listStyle, shapes } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/lib/theme';

import { SORT_OPTIONS, parsePantrySortOption } from './pantry-sort-options';

export function PantrySortFormSheetScreen({basePath}: {basePath: '/cart' | '/pantry'}) {
  const {colors, isDark} = useAppTheme();
  const router = useRouter();
  const {sort} = useLocalSearchParams<{sort?: string | string[]}>();
  const selectedOption = parsePantrySortOption(sort);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sort',
          headerLargeTitle: false,
          headerBackVisible: false,
          headerTitleAlign: 'center',
          sheetAllowedDetents: [0.33],
        }}
      />
      <Host colorScheme={isDark ? 'dark' : 'light'} style={[styles.host, {backgroundColor: colors.background}]}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section title="">
            {SORT_OPTIONS.map(option => {
              const isSelected = option.key === selectedOption;

              return (
                <ListItem
                  key={option.key}
                  onPress={() =>
                    router.replace({
                      pathname: basePath,
                      params: {sort: option.key},
                    })
                  }
                  leading={
                    <Text
                      modifiers={[
                        font({weight: 'bold', size: 13}),
                        foregroundStyle(isSelected ? colors.textInverse : 'secondaryLabel'),
                        frame({width: 28, height: 28}),
                        background(isSelected ? colors.tint : colors.listRowEmphasized, shapes.circle()),
                      ]}
                    >
                      {isSelected ? '✓' : ''}
                    </Text>
                  }
                >
                  <View style={styles.rowText}>
                    <Text modifiers={[font({weight: isSelected ? 'semibold' : 'regular', size: 17})]}>
                      {option.label}
                    </Text>
                  </View>
                </ListItem>
              );
            })}
          </Section>
        </List>
      </Host>
    </>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  rowText: {
    flex: 1,
  },
});
