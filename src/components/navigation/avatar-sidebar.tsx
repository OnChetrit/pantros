import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AvatarBadge } from '@/components/ui/primitives';
import { appColors } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export function AvatarSidebarButton() {
  const router = useRouter();
  const { profile } = useAppContext();

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

const styles = StyleSheet.create({
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.borderStrong,
    shadowColor: appColors.shadow,
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
