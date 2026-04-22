import { usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AvatarBadge } from '@/components/ui/primitives';
import { appColors } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

const SHEET_HIDDEN_OFFSET = 420;

type RouteItem = {
  href: '/profile' | '/notifications' | '/settings';
  label: string;
  marker: string;
};

const routeItems: RouteItem[] = [
  { href: '/profile', label: 'Profile', marker: 'P' },
  { href: '/notifications', label: 'Notifications', marker: 'N' },
  { href: '/settings', label: 'Settings', marker: 'S' },
];

export function AvatarSidebarButton() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAppContext();
  const [isMounted, setIsMounted] = useState(false);
  const sheetProgress = useRef(new Animated.Value(0)).current;

  const expanderName = useMemo(() => profile?.fullName ?? profile?.email ?? 'Pantry User', [profile?.email, profile?.fullName]);

  const openSidebar = () => {
    setIsMounted(true);
  };

  const closeSidebar = () => {
    Animated.timing(sheetProgress, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
      }
    });
  };

  useEffect(() => {
    if (!isMounted) {
      sheetProgress.setValue(0);
      return;
    }

    Animated.spring(sheetProgress, {
      toValue: 1,
      damping: 24,
      stiffness: 240,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [isMounted, sheetProgress]);

  const handleNavigate = (href: RouteItem['href']) => {
    closeSidebar();

    if (pathname !== href) {
      router.push(href);
    }
  };

  const handleSignOut = () => {
    closeSidebar();
    void signOut();
  };

  const scrimOpacity = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateY = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [SHEET_HIDDEN_OFFSET, 0],
  });

  return (
    <>
      <Pressable
        accessibilityLabel="Open account menu"
        onPress={openSidebar}
        style={({ pressed }) => [styles.avatarButton, pressed ? styles.avatarButtonPressed : null]}
      >
        <AvatarBadge name={expanderName} size={34} />
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        statusBarTranslucent
        visible={isMounted}
        onRequestClose={closeSidebar}
      >
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.backdrop, { opacity: scrimOpacity }]}>
            <Pressable style={styles.scrim} onPress={closeSidebar} />
          </Animated.View>
          <Animated.View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, 12) + 10,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.sheetGrabber} />

            <View style={styles.sheetHeader}>
              <View style={styles.profileRow}>
                <AvatarBadge name={expanderName} size={56} />
                <View style={styles.panelHeaderCopy}>
                  <Text style={styles.panelTitle}>{profile?.fullName ?? 'Pantry User'}</Text>
                  <Text style={styles.panelSubtitle}>{profile?.email ?? 'No email available'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.content}>
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionLabel}>Navigate</Text>
                <View style={styles.routeList}>
                  {routeItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <Pressable
                        key={item.href}
                        onPress={() => handleNavigate(item.href)}
                        style={({ pressed }) => [
                          styles.routeRow,
                          isActive ? styles.routeRowActive : null,
                          pressed ? styles.routeRowPressed : null,
                        ]}
                      >
                        <View style={[styles.routeMarker, isActive ? styles.routeMarkerActive : null]}>
                          <Text style={[styles.routeMarkerText, isActive ? styles.routeMarkerTextActive : null]}>
                            {item.marker}
                          </Text>
                        </View>
                        <Text style={styles.routeLabel}>{item.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable onPress={handleSignOut} style={({ pressed }) => [styles.signOutRow, pressed ? styles.routeRowPressed : null]}>
                <Text style={styles.signOutLabel}>Sign Out</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    marginRight: 2,
    borderRadius: 18,
  },
  avatarButtonPressed: {
    opacity: 0.82,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: appColors.overlay,
  },
  scrim: {
    flex: 1,
  },
  sheet: {
    backgroundColor: appColors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 16,
    shadowColor: appColors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: -6 },
    elevation: 14,
  },
  sheetGrabber: {
    alignSelf: 'center',
    width: 38,
    height: 5,
    borderRadius: 999,
    backgroundColor: appColors.grabber,
    marginBottom: 4,
  },
  sheetHeader: {
    gap: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  panelHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  panelTitle: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  panelSubtitle: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  content: {
    gap: 16,
  },
  sectionLabel: {
    color: appColors.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionGroup: {
    gap: 10,
  },
  routeList: {
    gap: 10,
  },
  routeRow: {
    borderRadius: 18,
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeRowActive: {
    backgroundColor: appColors.tintSoft,
    borderColor: appColors.borderStrong,
  },
  routeRowPressed: {
    opacity: 0.78,
  },
  routeMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.listRowEmphasized,
    borderWidth: 1,
    borderColor: appColors.borderStrong,
  },
  routeMarkerActive: {
    backgroundColor: appColors.tint,
    borderColor: appColors.tint,
  },
  routeMarkerText: {
    color: appColors.tint,
    fontSize: 13,
    fontWeight: '900',
  },
  routeMarkerTextActive: {
    color: appColors.card,
  },
  routeLabel: {
    flex: 1,
    color: appColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  signOutRow: {
    marginTop: 'auto',
    borderRadius: 18,
    backgroundColor: appColors.dangerSoft,
    borderWidth: 1,
    borderColor: appColors.danger,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutLabel: {
    color: appColors.danger,
    fontSize: 15,
    fontWeight: '800',
  },
});
