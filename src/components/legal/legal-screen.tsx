import { ScrollView, View } from 'react-native';
import type { PropsWithChildren } from 'react';

import { LegalSection } from '@/components/legal/legal-section';
import { AppStackHeader } from '@/components/navigation/app-stack-header';
import { AppButton, AppScreen, SectionCard, appColors } from '@/components/ui/primitives';

import { styles } from './legal-screen.styles';

export { LegalBullet } from './legal-bullet';
export { LegalParagraph } from './legal-paragraph';

function LegalScreenComponent({
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
      style={{flex: 1, backgroundColor: appColors.background}}
      contentContainerStyle={{paddingBottom: 40}}
      contentInsetAdjustmentBehavior="automatic"
    >
      {showHeader ? <AppStackHeader title={title} showAccountMenu={false} minimalBackButton /> : null}
      <AppScreen>
        <SectionCard title={title} subtitle={subtitle}>
          {children}
          {actions?.length ? (
            <View style={styles.actions}>
              {actions.map(action => (
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

export const LegalScreen = Object.assign(LegalScreenComponent, {Section: LegalSection});
