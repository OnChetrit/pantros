import { usePathname, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarBadge } from '@/components/ui/primitives';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { appColors } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

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
  const { profile, signOut } = useAppContext();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [pendingHref, setPendingHref] = useState<RouteItem['href'] | null>(null);
  const [pendingSignOut, setPendingSignOut] = useState(false);

  const expanderName = useMemo(() => profile?.fullName ?? profile?.email ?? 'Pantros User', [profile?.email, profile?.fullName]);

  const openSidebar = () => {
    setIsMenuVisible(true);
  };

  const closeSidebar = () => {
    setIsMenuVisible(false);
  };

  const handleNavigate = (href: RouteItem['href']) => {
    setPendingSignOut(false);
    setPendingHref(pathname !== href ? href : null);
    closeSidebar();
  };

  const handleSignOut = () => {
    setPendingHref(null);
    setPendingSignOut(true);
    closeSidebar();
  };

  const handleDismiss = useCallback(() => {
    if (pendingHref) {
      router.push(pendingHref);
      setPendingHref(null);
    }

    if (pendingSignOut) {
      setPendingSignOut(false);
      void signOut();
    }
  }, [pendingHref, pendingSignOut, router, signOut]);

  return (
    <>
      <Pressable
        accessibilityLabel="Open account menu"
        onPress={openSidebar}
        style={({ pressed }) => [styles.avatarButton, pressed ? styles.avatarButtonPressed : null]}
      >
        <AvatarBadge name={expanderName} size={34} />
      </Pressable>

      <BottomSheetModal visible={isMenuVisible} onClose={closeSidebar} onDismiss={handleDismiss}>
        <View style={styles.sheetHeader}>
          <View style={styles.profileRow}>
            <AvatarBadge name={expanderName} size={56} />
            <View style={styles.panelHeaderCopy}>
              <Text style={styles.panelTitle}>{profile?.fullName ?? 'Pantros User'}</Text>
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
      </BottomSheetModal>
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
