import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { Redirect, useRouter } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appColors } from '@/components/ui/primitives';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabPressOverlay = useRef(new Animated.Value(0)).current;
  const {isAuthenticated, status} = useAppContext();
  const {colors, isDark} = useAppTheme();

  const animateFabPress = (isPressed: boolean) => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: isPressed ? 0.92 : 1,
        damping: 18,
        stiffness: 360,
        mass: 0.7,
        useNativeDriver: true,
      }),
      Animated.timing(fabPressOverlay, {
        toValue: isPressed ? 1 : 0,
        duration: isPressed ? 90 : 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFabPressIn = () => {
    animateFabPress(true);
  };

  const handleFabPressOut = () => {
    animateFabPress(false);
  };

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.root}>
      <NativeTabs
        backgroundColor={colors.card}
        blurEffect="none"
        disableTransparentOnScrollEdge
        shadowColor={colors.border}
        tintColor={colors.tint}
        labelStyle={{
          default: {
            color: colors.muted,
            fontWeight: '600',
          },
          selected: {
            color: colors.tint,
            fontWeight: '700',
          },
        }}
      >
        <NativeTabs.Trigger
          name="pantry"
          contentStyle={{backgroundColor: colors.background}}
          disableTransparentOnScrollEdge
        >
          <NativeTabs.Trigger.Icon sf="refrigerator.fill" />
          <NativeTabs.Trigger.Label>Pantry</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="cart"
          contentStyle={{backgroundColor: colors.background}}
          disableTransparentOnScrollEdge
        >
          <NativeTabs.Trigger.Icon sf="cart.fill" />
          <NativeTabs.Trigger.Label>Cart</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="search"
          role="search"
          contentStyle={{backgroundColor: colors.background}}
          disableTransparentOnScrollEdge
        >
          <NativeTabs.Trigger.Icon sf="magnifyingglass" />
          <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>

      <View pointerEvents="box-none" style={[styles.fabLayer, {paddingBottom: insets.bottom}]}>
        <Animated.View style={[styles.fabShell, {transform: [{scale: fabScale}]}]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add Item"
            accessibilityHint="Opens the add item modal"
            onPress={() => router.push('/items/new')}
            onPressIn={handleFabPressIn}
            onPressOut={handleFabPressOut}
            style={[styles.fabButton, Platform.OS !== 'ios' ? {backgroundColor: colors.tint} : null]}
          >
            {Platform.OS === 'ios' ? (
              <>
                <GlassView
                  pointerEvents="auto"
                  style={styles.fabGlass}
                  glassEffectStyle="regular"
                  tintColor={colors.tint}
                  colorScheme={isDark ? 'dark' : 'light'}
                  isInteractive
                />
                {/* <View pointerEvents="none" style={[styles.fabTint, {backgroundColor: colors.tint}]} /> */}
                <Animated.View pointerEvents="none" style={[styles.fabPressOverlay, {opacity: fabPressOverlay}]} />
                {/* <View pointerEvents="none" style={styles.fabStroke} /> */}
              </>
            ) : null}
            <Ionicons name="add" size={24} color={colors.textInverse} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  fabLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 20,
  },
  fabShell: {
    width: 60,
    height: 60,
    marginRight: 22,
    marginBottom: 54,
    borderRadius: 30,
    shadowColor: appColors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 10,
  },
  fabButton: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fabGlass: {
    ...StyleSheet.absoluteFill,
    borderRadius: 30,
    overflow: 'hidden',
  },
  fabTint: {
    ...StyleSheet.absoluteFill,
    opacity: 0.28,
  },
  fabPressOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  fabStroke: {
    ...StyleSheet.absoluteFill,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.42)',
  },
});
