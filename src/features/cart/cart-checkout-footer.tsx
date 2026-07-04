import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/lib/theme';

import { CartCheckoutBar } from './cart-checkout-bar-content';
import { styles, type CartCheckoutBarProps } from './cart-checkout-bar.shared';

export function CartCheckoutFooter(props: CartCheckoutBarProps) {
  const insets = useSafeAreaInsets();
  const {colors} = useAppTheme();

  return (
    <View
      style={[
        styles.footerWrap,
        {
          paddingBottom: Math.max(insets.bottom, 14),
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      ]}
    >
      <CartCheckoutBar {...props} />
    </View>
  );
}
