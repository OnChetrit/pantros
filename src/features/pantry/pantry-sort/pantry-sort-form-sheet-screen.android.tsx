import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/lib/theme';

import { SORT_OPTIONS, parsePantrySortOption } from './pantry-sort-options';

export function PantrySortFormSheetScreen({basePath}: {basePath: '/cart' | '/pantry'}) {
  const {colors} = useAppTheme();
  const router = useRouter();
  const {sort} = useLocalSearchParams<{sort?: string | string[]}>();
  const selectedOption = parsePantrySortOption(sort);

  return (
    <>
      <Stack.Screen options={{title: 'Sort', headerTitleAlign: 'center'}} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        style={{backgroundColor: colors.background}}
      >
        <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
          {SORT_OPTIONS.map(option => {
            const isSelected = option.key === selectedOption;

            return (
              <Pressable
                key={option.key}
                accessibilityRole="radio"
                accessibilityState={{selected: isSelected}}
                onPress={() =>
                  router.replace({
                    pathname: basePath,
                    params: {sort: option.key},
                  })
                }
                style={({pressed}) => [styles.row, pressed ? styles.pressed : null]}
              >
                <View
                  style={[
                    styles.check,
                    {
                      backgroundColor: isSelected ? colors.tint : colors.background,
                      borderColor: isSelected ? colors.tint : colors.borderStrong,
                    },
                  ]}
                >
                  {isSelected ? <Text style={{color: colors.textInverse}}>✓</Text> : null}
                </View>
                <Text style={[styles.label, {color: colors.text}]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
  },
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D0D0D0',
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
