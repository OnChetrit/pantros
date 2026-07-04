import { Text, View, Pressable } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { createStyles } from '../primitives.shared';

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
