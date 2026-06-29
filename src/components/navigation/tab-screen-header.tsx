import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar';
import { useThemedStyles } from '@/lib/theme';

export function TabScreenHeader({
  title,
  onAddItem,
  scrollY,
}: {
  title: string;
  onAddItem: () => void;
  scrollY: Animated.Value;
}) {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const progress = scrollY.interpolate({
    inputRange: [0, 52],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const height = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [insets.top + 68, insets.top + 54],
  });
  const borderBottomWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, StyleSheet.hairlineWidth],
  });
  const largeTitleOpacity = progress.interpolate({
    inputRange: [0, 0.72],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const largeTitleTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
  const compactTitleOpacity = progress.interpolate({
    inputRange: [0.42, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const compactTitleTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  return (
    <Animated.View style={[styles.screenHeader, { height, paddingTop: insets.top, borderBottomWidth }]}>
      <Animated.Text
        style={[
          styles.largeTitle,
          {
            opacity: largeTitleOpacity,
            transform: [{ translateY: largeTitleTranslateY }],
          },
        ]}
      >
        {title}
      </Animated.Text>
      <Animated.Text
        style={[
          styles.compactTitle,
          {
            opacity: compactTitleOpacity,
            transform: [{ translateY: compactTitleTranslateY }],
          },
        ]}
      >
        {title}
      </Animated.Text>
      <View style={styles.headerActions}>
        <Pressable
          accessibilityLabel="Add Item"
          onPress={onAddItem}
          style={({ pressed }) => [styles.addButton, pressed ? styles.addButtonPressed : null]}
        >
          <Text style={styles.addButtonIcon}>+</Text>
        </Pressable>
        <AvatarSidebarButton />
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) => StyleSheet.create({
  screenHeader: {
    backgroundColor: colors.background,
    borderBottomWidth: 0,
    borderBottomColor: colors.borderStrong,
    overflow: 'hidden',
  },
  largeTitle: {
    position: 'absolute',
    left: 20,
    right: 132,
    bottom: 6,
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  compactTitle: {
    position: 'absolute',
    left: 72,
    right: 72,
    bottom: 16,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  headerActions: {
    position: 'absolute',
    right: 16,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  addButtonIcon: {
    color: colors.tint,
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 24,
    marginTop: -1,
  },
});
