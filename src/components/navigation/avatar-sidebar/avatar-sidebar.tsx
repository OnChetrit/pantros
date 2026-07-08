import { Button, Host, RNHostView } from '@expo/ui';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { AvatarBadge } from '@/components/ui/primitives';
import { useThemedStyles } from '@/lib/theme';
import { useWorkspaceState } from '@/state/workspace-state';

export function AvatarSidebarButton() {
  const router = useRouter();
  const {profile} = useWorkspaceState();
  const styles = useThemedStyles(createStyles);

  const expanderName = useMemo(
    () => profile?.fullName ?? profile?.email ?? 'Pantros User',
    [profile?.email, profile?.fullName]
  );

  return (
    <Host>
      <Button onPress={() => router.push('/account/menu')} variant="text" style={styles.avatarButton as never}>
        <RNHostView matchContents>
          <AvatarBadge
            name={expanderName}
            imageUrl={profile?.avatarUrl}
            size={34}
            showBackground={false}
          />
        </RNHostView>
      </Button>
    </Host>
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
});
