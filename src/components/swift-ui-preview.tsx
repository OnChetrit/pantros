import { Host, Button as SwiftUIButton, Text as SwiftUIText, VStack } from '@expo/ui/swift-ui';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

export function SwiftUiPreview() {
  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>SwiftUI Preview</Text>
        <Text style={styles.fallbackBody}>
          `@expo/ui/swift-ui` is iOS-only. Android and web keep the same architecture, but the native SwiftUI surfaces
          are validated in iOS development builds.
        </Text>
      </View>
    );
  }

  return (
    <Host matchContents>
      <VStack spacing={12}>
        <SwiftUIText>Native iOS action preview</SwiftUIText>
        <SwiftUIButton
          label="Open planning flow"
          onPress={() => Alert.alert('SwiftUI wired', 'Expo UI is installed and available for the rewrite.')}
        />
      </VStack>
    </Host>
  );
}

const styles = StyleSheet.create({
  fallback: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#f3ebde',
    gap: 6,
  },
  fallbackTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#332a20',
  },
  fallbackBody: {
    fontSize: 14,
    lineHeight: 21,
    color: '#62594d',
  },
});
