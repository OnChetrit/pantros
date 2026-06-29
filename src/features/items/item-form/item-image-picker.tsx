import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

type ItemImagePickerProps = {
  image: string;
  onPress: () => void;
};

export function ItemImagePicker({ image, onPress }: ItemImagePickerProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable onPress={onPress} style={styles.imageButton}>
      {image ? (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>No Image</Text>
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    imageButton: {
      width: 88,
      height: 88,
      borderRadius: 44,
      overflow: 'hidden',
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
    },
    imagePreview: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.input,
    },
    imagePlaceholderText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
    },
  });
