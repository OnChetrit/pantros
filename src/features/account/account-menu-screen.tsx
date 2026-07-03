import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { DeleteAccountContent } from '@/components/account/delete-account-content';
import { LegalDocumentScreen } from '@/components/legal/legal-document-screen';
import { AccountMenuContent, type AccountMenuDestination } from '@/components/navigation/account-menu-content';
import { getLegalDocument } from '@/content/legal-content';
import { contactSupport } from '@/lib/support';
import { appColors, useAppTheme } from '@/lib/theme';

type AccountMenuPage = 'menu' | AccountMenuDestination;

const pageTitleMap: Record<AccountMenuPage, string> = {
  menu: '',
  delete: 'Delete Account',
  privacy: 'Privacy Policy',
  support: 'Support',
  terms: 'Terms of Service',
};

export function AccountMenuScreen({ios}: {ios: boolean}) {
  const router = useRouter();
  const {colors} = useAppTheme();
  const [pageStack, setPageStack] = useState<AccountMenuPage[]>(['menu']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(Dimensions.get('window').width);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animatedIndex] = useState(() => new Animated.Value(0));
  const currentPage = pageStack[activeIndex] ?? 'menu';
  const isRootPage = currentPage === 'menu';

  const runTransition = useCallback(
    (nextIndex: number, onComplete?: () => void) => {
      setIsTransitioning(true);

      Animated.timing(animatedIndex, {
        toValue: nextIndex,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({finished}) => {
        if (!finished) {
          return;
        }

        onComplete?.();
        setIsTransitioning(false);
      });
    },
    [animatedIndex]
  );

  const handleNavigate = useCallback(
    (destination: AccountMenuDestination) => {
      if (isTransitioning || currentPage === destination) {
        return;
      }

      const nextIndex = activeIndex + 1;

      setPageStack(currentStack => [...currentStack, destination]);
      setActiveIndex(nextIndex);
      runTransition(nextIndex);
    },
    [activeIndex, currentPage, isTransitioning, runTransition]
  );

  const handleGoBack = useCallback(() => {
    if (isTransitioning || activeIndex === 0) {
      return;
    }

    const nextIndex = activeIndex - 1;

    setActiveIndex(nextIndex);
    runTransition(nextIndex, () => {
      setPageStack(currentStack => currentStack.slice(0, -1));
    });
  }, [activeIndex, isTransitioning, runTransition]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nextWidth = event.nativeEvent.layout.width;

      if (nextWidth > 0 && Math.abs(nextWidth - pageWidth) > 1) {
        setPageWidth(nextWidth);
      }
    },
    [pageWidth]
  );

  useFocusEffect(
    useCallback(() => {
      if (isRootPage) {
        return undefined;
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleGoBack();
        return true;
      });

      return () => {
        subscription.remove();
      };
    }, [handleGoBack, isRootPage])
  );

  const renderPage = useCallback(
    (page: AccountMenuPage) => {
      if (page === 'menu') {
        return <AccountMenuContent onNavigate={handleNavigate} />;
      }

      if (page === 'delete') {
        return <DeleteAccountContent />;
      }

      const document = getLegalDocument(page);

      if (!document) {
        return null;
      }

      return (
        <LegalDocumentScreen
          document={document}
          showHeader={false}
          actions={
            page === 'support'
              ? [
                  {
                    label: 'Email Support',
                    onPress: () => {
                      void contactSupport();
                    },
                  },
                ]
              : undefined
          }
        />
      );
    },
    [handleNavigate]
  );

  const stackedPages = useMemo(
    () =>
      pageStack.map((page, index) => {
        const translateX = Animated.multiply(Animated.subtract(animatedIndex, index), -pageWidth);
        const isVisibleLayer = index === activeIndex || index === activeIndex + 1;

        return (
          <Animated.View
            key={`${page}-${index}`}
            pointerEvents={index === activeIndex && !isTransitioning ? 'auto' : 'none'}
            style={[
              styles.page,
              {
                backgroundColor: colors.background,
                transform: [{translateX}],
                zIndex: isVisibleLayer ? 2 : 1,
              },
            ]}
          >
            {renderPage(page)}
          </Animated.View>
        );
      }),
    [activeIndex, animatedIndex, colors.background, isTransitioning, pageStack, pageWidth, renderPage]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: pageTitleMap[currentPage],
          presentation: 'modal',
          headerBackVisible: false,
          headerShadowVisible: true,
          headerTransparent: ios,
          headerBackground: ios ? () => <View style={StyleSheet.absoluteFill} /> : undefined,
          headerStyle: {
            backgroundColor: ios ? 'transparent' : colors.background,
          },
          headerLeft: isRootPage
            ? undefined
            : () => (
                <Pressable
                  accessibilityLabel="Go back in account menu"
                  onPress={handleGoBack}
                  style={({pressed}) => [styles.headerButton, pressed ? styles.closeButtonPressed : null]}
                >
                  <Ionicons
                    name={ios ? 'chevron-back' : 'arrow-back'}
                    size={ios ? 28 : 22}
                    color={colors.tint}
                  />
                </Pressable>
              ),
          headerRight: () => (
            <Pressable
              accessibilityLabel="Close account menu"
              onPress={handleClose}
              style={({pressed}) => [styles.headerButton, pressed ? styles.closeButtonPressed : null]}
            >
              <Ionicons
                name="close"
                size={ios ? 30 : 22}
                color={ios ? appColors.muted : colors.text}
              />
            </Pressable>
          ),
        }}
      />
      <View style={styles.pageStack} onLayout={handleLayout}>
        {stackedPages}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pageStack: {
    flex: 1,
    overflow: 'hidden',
  },
  page: {
    ...StyleSheet.absoluteFill,
  },
  headerButton: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    opacity: 0.76,
  },
});
