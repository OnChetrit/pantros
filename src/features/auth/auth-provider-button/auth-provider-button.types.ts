import { Ionicons } from '@expo/vector-icons';

export type AuthProviderButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled: boolean;
};
