import type { AppThemeColors } from '@/lib/theme';
import { useAppTheme, useThemedStyles } from '@/lib/theme';
import type { PropsWithChildren, ReactNode, Ref } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export { appColors } from '@/lib/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function AppScreen({children}: PropsWithChildren) {
  const styles = useThemedStyles(createStyles);

  return <View style={styles.screen}>{children}</View>;
}

export function SectionCard({
  title,
  subtitle,
  children,
  rightSlot,
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}>) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
        </View>
        {rightSlot}
      </View>
      {children}
    </View>
  );
}

export function AppButton({label, onPress, variant = 'primary', disabled}: ButtonProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        (pressed || disabled) && styles.buttonPressed,
      ]}
    >
      <Text style={variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function AppTextInput({
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
  autoCorrect = false,
  autoFocus = false,
  inputRef,
  rightSlot,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  inputRef?: Ref<TextInput>;
  rightSlot?: ReactNode;
}) {
  const {colors} = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.inputShell}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        style={[styles.input, rightSlot ? styles.inputWithRightSlot : null]}
      />
      {rightSlot ? <View style={styles.inputRightSlot}>{rightSlot}</View> : null}
    </View>
  );
}

export function KeyValueRow({label, value}: {label: string; value: string}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function EmptyNotice({title, body}: {title: string; body: string}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function MetricPill({
  value,
  label,
  tone = 'default',
}: {
  value: string;
  label: string;
  tone?: 'default' | 'accent' | 'warning';
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View
      style={[
        styles.metricPill,
        tone === 'accent' ? styles.metricPillAccent : null,
        tone === 'warning' ? styles.metricPillWarning : null,
      ]}
    >
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function MetricGrid({children}: PropsWithChildren) {
  const styles = useThemedStyles(createStyles);

  return <View style={styles.metricGrid}>{children}</View>;
}

export function AvatarBadge({
  name,
  size = 38,
  imageUrl,
  showBackground = true,
  style,
}: {
  name?: string | null;
  size?: number;
  imageUrl?: string | null;
  showBackground?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const {colors} = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const initials = (name ?? 'Pantros User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: showBackground ? colors.tint : 'transparent',
          borderWidth: showBackground ? 1 : 0,
        },
        style,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{uri: imageUrl}}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      ) : (
        <Text style={[styles.avatarText, {fontSize: Math.max(12, size * 0.34)}]}>{initials}</Text>
      )}
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  rightValue,
  emphasized = false,
  onPress,
}: {
  title: string;
  subtitle?: string;
  rightValue?: string;
  emphasized?: boolean;
  onPress?: () => void;
}) {
  const styles = useThemedStyles(createStyles);

  const content = (
    <>
      <View style={styles.listRowCopy}>
        <Text style={styles.listRowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.listRowSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightValue ? <Text style={styles.listRowValue}>{rightValue}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({pressed}) => [
          styles.listRow,
          emphasized ? styles.listRowEmphasized : null,
          pressed ? styles.listRowPressed : null,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.listRow, emphasized ? styles.listRowEmphasized : null]}>{content}</View>;
}

const createStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
      gap: 16,
    },
    card: {
      borderRadius: 24,
      padding: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
    },
    cardHeader: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    cardCopy: {
      flex: 1,
      gap: 4,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    cardSubtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.muted,
    },
    button: {
      minHeight: 46,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    primaryButton: {
      backgroundColor: colors.tint,
    },
    secondaryButton: {
      backgroundColor: colors.tintSoft,
    },
    primaryButtonText: {
      color: colors.textInverse,
      fontWeight: '700',
      fontSize: 15,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 15,
    },
    buttonPressed: {
      opacity: 0.75,
    },
    inputShell: {
      minHeight: 50,
      borderRadius: 16,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      minHeight: 50,
      flex: 1,
      paddingHorizontal: 16,
      color: colors.text,
      fontSize: 15,
    },
    inputWithRightSlot: {
      paddingRight: 10,
    },
    inputRightSlot: {
      paddingRight: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
    },
    rowLabel: {
      flex: 1,
      color: colors.muted,
      fontSize: 14,
    },
    rowValue: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      textAlign: 'right',
    },
    emptyState: {
      borderRadius: 20,
      padding: 16,
      backgroundColor: colors.empty,
      gap: 6,
      display: 'flex',
      justifyContent: 'center',
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    emptyBody: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    metricPill: {
      minWidth: 96,
      flexGrow: 1,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.metric,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 2,
    },
    metricPillAccent: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.border,
    },
    metricPillWarning: {
      backgroundColor: colors.warningSoft,
      borderColor: colors.border,
    },
    metricValue: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    metricLabel: {
      color: colors.muted,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    avatar: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.tint,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    avatarText: {
      color: colors.text,
      fontWeight: '800',
    },
    listRow: {
      flexDirection: 'row',
      gap: 14,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.listRow,
      borderWidth: 1,
      borderColor: colors.border,
    },
    listRowEmphasized: {
      backgroundColor: colors.listRowEmphasized,
    },
    listRowPressed: {
      opacity: 0.76,
    },
    listRowCopy: {
      flex: 1,
      gap: 4,
    },
    listRowTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    listRowSubtitle: {
      color: colors.muted,
      fontSize: 13,
      lineHeight: 18,
    },
    listRowValue: {
      color: colors.tint,
      fontSize: 13,
      fontWeight: '700',
    },
  });
