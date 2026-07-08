import { Button, Host, Text } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { createStyles } from './shared/primitives.shared';

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
  const rowStyle = StyleSheet.compose(styles.listRow, emphasized ? styles.listRowEmphasized : null);
  const rowViewStyle = rowStyle as never;

  const content = (
    <>
      <View style={styles.listRowCopy}>
        <Text textStyle={styles.listRowTitle}>{title}</Text>
        {subtitle ? <Text textStyle={styles.listRowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.listRowSpacer} />
      {rightValue ? <Text textStyle={styles.listRowValue}>{rightValue}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Host>
        <Button
          onPress={onPress}
          variant="text"
          style={rowViewStyle}
        >
          <View style={styles.listRowContent}>
            {content}
          </View>
        </Button>
      </Host>
    );
  }

  return (
    <Host>
      <View style={[rowViewStyle, styles.listRowContent]}>
        {content}
      </View>
    </Host>
  );
}
