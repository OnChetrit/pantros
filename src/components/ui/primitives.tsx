import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { PropsWithChildren, ReactNode, Ref } from 'react';
import { appColors } from '@/lib/theme';

export { appColors } from '@/lib/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function AppScreen({ children }: PropsWithChildren) {
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

export function AppButton({ label, onPress, variant = 'primary', disabled }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        (pressed || disabled) && styles.buttonPressed,
      ]}
    >
      <Text style={variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText}>
        {label}
      </Text>
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
  return (
    <View style={styles.inputShell}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={appColors.muted}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        style={[styles.input, rightSlot ? styles.inputWithRightSlot : null]}
      />
      {rightSlot ? <View style={styles.inputRightSlot}>{rightSlot}</View> : null}
    </View>
  );
}

export function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function EmptyNotice({ title, body }: { title: string; body: string }) {
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

export function MetricGrid({ children }: PropsWithChildren) {
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
  const initials = (name ?? 'Pantros User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: showBackground ? appColors.tint : 'transparent',
          borderWidth: showBackground ? 1 : 0,
        },
        style,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      ) : (
        <Text style={[styles.avatarText, { fontSize: Math.max(12, size * 0.34) }]}>{initials}</Text>
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
        style={({ pressed }) => [
          styles.listRow,
          emphasized ? styles.listRowEmphasized : null,
          pressed ? styles.listRowPressed : null,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.listRow, emphasized ? styles.listRowEmphasized : null]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
    padding: 20,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
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
    color: appColors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: appColors.muted,
  },
  button: {
    minHeight: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: appColors.tint,
  },
  secondaryButton: {
    backgroundColor: appColors.tintSoft,
  },
  primaryButtonText: {
    color: appColors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButtonText: {
    color: appColors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  inputShell: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: appColors.input,
    borderWidth: 1,
    borderColor: appColors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    minHeight: 50,
    flex: 1,
    paddingHorizontal: 16,
    color: appColors.text,
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
    color: appColors.muted,
    fontSize: 14,
  },
  rowValue: {
    flex: 1,
    color: appColors.text,
    fontSize: 14,
    textAlign: 'right',
  },
  emptyState: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: appColors.empty,
    gap: 6,
  },
  emptyTitle: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyBody: {
    color: appColors.muted,
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
    backgroundColor: appColors.metric,
    borderWidth: 1,
    borderColor: appColors.border,
    gap: 2,
  },
  metricPillAccent: {
    backgroundColor: appColors.accentSoft,
    borderColor: appColors.border,
  },
  metricPillWarning: {
    backgroundColor: appColors.warningSoft,
    borderColor: appColors.border,
  },
  metricValue: {
    color: appColors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    color: appColors.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.tint,
    borderWidth: 1,
    borderColor: appColors.borderStrong,
  },
  avatarText: {
    color: appColors.textInverse,
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
    backgroundColor: appColors.listRow,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  listRowEmphasized: {
    backgroundColor: appColors.listRowEmphasized,
  },
  listRowPressed: {
    opacity: 0.76,
  },
  listRowCopy: {
    flex: 1,
    gap: 4,
  },
  listRowTitle: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  listRowSubtitle: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  listRowValue: {
    color: appColors.tint,
    fontSize: 13,
    fontWeight: '700',
  },
});
