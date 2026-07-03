import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PropsWithChildren } from 'react';

import { LegalSection } from '@/components/legal/legal-section';
import { AppStackHeader } from '@/components/navigation/app-stack-header';
import { AppButton, AppScreen, SectionCard, appColors } from '@/components/ui/primitives';

export function LegalParagraph({ children }: PropsWithChildren) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

export function LegalBullet({ children }: PropsWithChildren) {
  return <Text style={styles.bullet}>{`\u2022 ${children}`}</Text>;
}

export function LegalScreen({
  title,
  subtitle,
  actions,
  showHeader = true,
  children,
}: PropsWithChildren<{
  title: string;
  subtitle: string;
  actions?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
  }[];
  showHeader?: boolean;
}>) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: appColors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      {showHeader ? (
        <AppStackHeader title={title} showAccountMenu={false} minimalBackButton />
      ) : null}
      <AppScreen>
        <SectionCard title={title} subtitle={subtitle}>
          {children}
          {actions?.length ? (
            <View style={styles.actions}>
              {actions.map((action) => (
                <AppButton
                  key={action.label}
                  label={action.label}
                  onPress={action.onPress}
                  variant={action.variant ?? 'secondary'}
                />
              ))}
            </View>
          ) : null}
        </SectionCard>
      </AppScreen>
    </ScrollView>
  );
}

LegalScreen.Section = LegalSection;

const styles = StyleSheet.create({
  paragraph: {
    color: appColors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  bullet: {
    color: appColors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
    paddingTop: 4,
  },
});
