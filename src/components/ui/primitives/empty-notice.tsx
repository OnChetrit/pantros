import { Column, Host, Text } from '@expo/ui';

import { useThemedStyles } from '@/lib/theme';

import { createStyles } from './shared/primitives.shared';

export function EmptyNotice({title, body}: {title: string; body: string}) {
  const styles = useThemedStyles(createStyles);

  return (
    <Host>
      <Column spacing={6} style={styles.emptyState}>
        <Text textStyle={styles.emptyTitle}>{title}</Text>
        <Text textStyle={styles.emptyBody}>{body}</Text>
      </Column>
    </Host>
  );
}
