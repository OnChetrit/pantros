import { Host, RNHostView, Row } from '@expo/ui';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemedStyles } from '@/lib/theme';

import { ScanIconCircleButton } from '../scan-icon-circle-button/scan-icon-circle-button';

export function ScanPermissionState({
  title,
  body,
  icon = 'camera-outline',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  onClose,
  highlights = [],
}: {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  onClose?: () => void;
  highlights?: string[];
}) {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.permissionScreen, {paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20}]}>
      <Host style={styles.permissionTopBar} matchContents>
        <Row alignment="center">
          <RNHostView matchContents>
            {onClose ? <ScanIconCircleButton icon="close" label="Close scanner" onPress={onClose} /> : <View style={styles.topBarSpacer} />}
          </RNHostView>
        </Row>
      </Host>

      <View style={styles.permissionContent}>
        <View style={styles.permissionIconOuter}>
          <View style={styles.permissionIconInner}>
            <Ionicons name={icon} size={34} color={styles.iconTint.color} />
          </View>
        </View>

        <View style={styles.permissionCopy}>
          <Text style={styles.permissionTitle}>{title}</Text>
          <Text style={styles.permissionBody}>{body}</Text>
        </View>

        {highlights.length > 0 ? (
          <View style={styles.highlightList}>
            {highlights.map(highlight => (
              <Host key={highlight} style={styles.highlightRow}>
                <Row alignment="center" spacing={10}>
                  <RNHostView matchContents>
                    <Ionicons name="checkmark-circle" size={18} color={styles.iconTint.color} />
                  </RNHostView>
                  <RNHostView matchContents>
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </RNHostView>
                </Row>
              </Host>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.permissionActions}>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={({pressed}) => [
              styles.permissionActionButton,
              styles.permissionActionButtonPrimary,
              pressed ? styles.buttonPressed : null,
            ]}
          >
            <Host style={styles.permissionActionButton} matchContents>
              <Row alignment="center" spacing={10}>
                <RNHostView matchContents>
                  <Ionicons name="camera-outline" size={20} color={styles.primaryButtonText.color} />
                </RNHostView>
                <RNHostView matchContents>
                  <Text style={styles.primaryButtonText}>{actionLabel}</Text>
                </RNHostView>
              </Row>
            </Host>
          </Pressable>
        ) : null}
        {secondaryActionLabel && onSecondaryAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onSecondaryAction}
            style={({pressed}) => [
              styles.permissionActionButton,
              styles.permissionActionButtonSecondary,
              pressed ? styles.buttonPressed : null,
            ]}
          >
            <Host style={styles.permissionActionButton} matchContents>
              <Row alignment="center" spacing={10}>
                <RNHostView matchContents>
                  <Ionicons name="search-outline" size={20} color={styles.secondaryButtonText.color} />
                </RNHostView>
                <RNHostView matchContents>
                  <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
                </RNHostView>
              </Row>
            </Host>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    permissionScreen: {
      flex: 1,
      justifyContent: 'space-between',
      gap: 24,
      paddingHorizontal: 20,
      backgroundColor: colors.background,
    },
    permissionTopBar: {
      minHeight: 44,
    },
    topBarSpacer: {
      width: 44,
      height: 44,
    },
    permissionContent: {
      flex: 1,
      justifyContent: 'center',
      gap: 22,
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
    },
    permissionIconOuter: {
      width: 106,
      height: 106,
      borderRadius: 53,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.tintSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    permissionIconInner: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    iconTint: {
      color: colors.tint,
    },
    permissionCopy: {
      gap: 10,
    },
    permissionTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '900',
      lineHeight: 34,
      textAlign: 'center',
    },
    permissionBody: {
      color: colors.muted,
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
      textAlign: 'center',
    },
    highlightList: {
      gap: 12,
    },
    highlightRow: {
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    highlightText: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    permissionActions: {
      gap: 12,
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
    },
    permissionActionButton: {
      minHeight: 52,
      borderRadius: 18,
      paddingHorizontal: 18,
    },
    permissionActionButtonPrimary: {
      backgroundColor: colors.tint,
    },
    permissionActionButtonSecondary: {
      backgroundColor: colors.tintSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primaryButtonText: {
      color: colors.textInverse,
      fontSize: 15,
      fontWeight: '800',
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
    },
    buttonPressed: {
      opacity: 0.75,
    },
  });
