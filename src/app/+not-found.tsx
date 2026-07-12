import { Stack, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/lib/theme';

export default function NotFoundScreen() {
  const {colors} = useAppTheme();

  return (
    <>
      <Stack.Screen options={{title: 'Not Found'}} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        style={[styles.screen, {backgroundColor: colors.background}]}
      >
        <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Text style={[styles.title, {color: colors.text}]}>This screen does not exist.</Text>
          <Text style={[styles.body, {color: colors.muted}]}>
            Return to the pantry, cart, or search tab and continue from there.
          </Text>
          <Pressable onPress={() => router.replace('/pantry')} style={[styles.button, {backgroundColor: colors.tint}]}>
            <Text style={[styles.buttonLabel, {color: colors.textInverse}]}>Go to Pantry</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginTop: 8,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
});
