import { Button, Host } from '@expo/ui';
import { StyleSheet } from 'react-native';

export function ActionButton({
  label,
  onPress,
  disabled: isDisabled,
  primary = false,
  subtle = false,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  primary?: boolean;
  subtle?: boolean;
}) {
  return (
    <Host matchContents style={styles.host}>
      <Button
        label={label}
        disabled={isDisabled}
        onPress={onPress}
        variant={subtle ? 'text' : primary ? 'filled' : 'outlined'}
      />
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    alignSelf: 'stretch',
  },
});
