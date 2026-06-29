import { StyleSheet, Text, View } from 'react-native';

import { AvatarBadge } from '@/components/ui/primitives';
import { useThemedStyles } from '@/lib/theme';

type AccountProfileHeaderProps = {
  name: string;
  email?: string | null;
  imageUrl?: string | null;
};

export function AccountProfileHeader({ name, email, imageUrl }: AccountProfileHeaderProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.profileHeader}>
      <AvatarBadge name={name} imageUrl={imageUrl} size={92} style={styles.profileAvatar} />
      <Text style={styles.profileName}>{name}</Text>
      {email ? <Text style={styles.profileEmail}>{email}</Text> : null}
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    profileHeader: {
      alignItems: 'center',
      gap: 8,
      paddingTop: 6,
      paddingBottom: 10,
    },
    profileAvatar: {
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    profileName: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
      textAlign: 'center',
    },
    profileEmail: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
  });
