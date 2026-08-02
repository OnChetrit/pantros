import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AvatarBadge } from '@/components/ui/primitives';
import { useThemedStyles } from '@/lib/theme';
import { useWorkspaceState } from '@/state/workspace-state';

export function AvatarSidebarButton() {
  const router = useRouter();
  const {profile} = useWorkspaceState();
  const styles = useThemedStyles(createStyles);
  const name = profile?.fullName ?? profile?.email ?? 'Pantros User';

  return (
    <Pressable
      accessibilityLabel="Open account settings"
      accessibilityRole="button"
      onPress={() => router.push('/account/menu')}
      style={({pressed}) => [styles.avatarButton, pressed ? styles.pressed : null]}
    >
      <AvatarBadge name={name} imageUrl={profile?.avatarUrl} size={34} showBackground={false} />
    </Pressable>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    avatarButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      elevation: 3,
    },
    pressed: {
      opacity: 0.72,
    },
  });
