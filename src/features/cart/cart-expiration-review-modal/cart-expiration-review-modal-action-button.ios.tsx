import { Button, Host } from '@expo/ui';
import { buttonBorderShape, buttonStyle, controlSize, disabled } from '@expo/ui/swift-ui/modifiers';
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
        onPress={onPress}
        modifiers={[
          disabled(isDisabled),
          controlSize('large'),
          buttonStyle(subtle ? 'plain' : primary ? 'glassProminent' : 'glass'),
          buttonBorderShape('roundedRectangle', 16),
        ]}
      />
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    alignSelf: 'stretch',
    flex: 1,
  },
});
