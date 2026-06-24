import type {
  AccountDeletionDecision,
  AccountDeletionPreview,
} from '@/domain/models';

import { supabase } from './client';

async function getFunctionErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'context' in error &&
    error.context instanceof Response
  ) {
    try {
      const payload = (await error.context.json()) as { error?: unknown };

      if (typeof payload.error === 'string' && payload.error) {
        return payload.error;
      }
    } catch {
      // Use the stable fallback below when the function returned no JSON body.
    }
  }

  return fallback;
}

export async function fetchAccountDeletionPreview(): Promise<AccountDeletionPreview> {
  const { data, error } = await supabase.functions.invoke('delete-account', {
    body: {
      operation: 'preview',
    },
  });

  if (error) {
    throw new Error(
      await getFunctionErrorMessage(error, 'Unable to load account deletion details.')
    );
  }

  return data as AccountDeletionPreview;
}

export async function deleteCurrentAccount(
  decisions: AccountDeletionDecision[]
) {
  const { data, error } = await supabase.functions.invoke('delete-account', {
    body: {
      operation: 'delete',
      confirmation: 'DELETE',
      decisions,
    },
  });

  if (error) {
    throw new Error(
      await getFunctionErrorMessage(error, 'Unable to delete your account.')
    );
  }

  if (!data?.deleted) {
    throw new Error('The account deletion did not complete.');
  }
}
