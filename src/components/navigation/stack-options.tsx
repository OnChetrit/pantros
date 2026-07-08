import { Host, RNHostView, Row } from '@expo/ui';
import { Platform } from 'react-native';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar/avatar-sidebar';
import { createIconHeaderButton } from '@/components/navigation/native-header-items/native-header-items';
import { useAppTheme } from '@/lib/theme';

export function useBaseStackOptions() {
  const {colors} = useAppTheme();

  return {
    contentStyle: {backgroundColor: colors.background},
    headerShadowVisible: false,
    headerStyle: {backgroundColor: colors.background},
    headerTintColor: colors.tint,
    headerTitleStyle: {color: colors.text},
    headerLargeTitleStyle: {color: colors.text},
  };
}

export function useTopLevelStackOptions({title, onAccountPress}: {title?: string; onAccountPress: () => void}) {
  const {colors} = useAppTheme();

  return {
    title,
    headerLargeTitle: Platform.OS === 'ios',
    headerTransparent: Platform.OS === 'ios',
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background,
    },
    unstable_headerRightItems:
      Platform.OS === 'ios'
        ? () => [
            createIconHeaderButton({
              label: 'Open account menu',
              icon: 'person.crop.circle',
              onPress: onAccountPress,
              tintColor: colors.tint,
            }),
          ]
        : undefined,
    headerRight:
      Platform.OS === 'ios'
        ? undefined
        : () => (
            <Host matchContents>
              <Row alignment="center">
                <RNHostView matchContents>
                  <AvatarSidebarButton />
                </RNHostView>
              </Row>
            </Host>
          ),
  };
}

export function createDetailStackOptions(title: string) {
  return {
    title,
    headerLargeTitle: false,
    headerBackVisible: true,
    headerBackButtonDisplayMode: 'minimal' as const,
  };
}
