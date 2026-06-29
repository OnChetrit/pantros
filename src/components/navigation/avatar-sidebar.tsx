import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AvatarBadge } from '@/components/ui/primitives';
import { useThemedStyles } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export function AvatarSidebarButton() {
  const router = useRouter();
  const { profile } = useAppContext();
  const styles = useThemedStyles(createStyles);

  const expanderName = useMemo(
    () => profile?.fullName ?? profile?.email ?? 'Pantros User',
    [profile?.email, profile?.fullName]
  );

  return (
    <Pressable
      accessibilityLabel="Open account menu"
      onPress={() => router.push('/account/menu')}
      style={({ pressed }) => [styles.avatarButton, pressed ? styles.avatarButtonPressed : null]}
    >
      <AvatarBadge
        name={expanderName}
        imageUrl={profile?.avatarUrl}
        size={34}
        showBackground={false}
      />
    </Pressable>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) => StyleSheet.create({
  avatarButton: {
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
  avatarButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});
