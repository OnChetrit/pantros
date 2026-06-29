import type {
  AccountDeletionDecision,
  AccountDeletionPreview,
} from '@/domain/models';

export type DecisionMap = Record<string, AccountDeletionDecision>;

export function createDefaultDecisions(
  preview: AccountDeletionPreview
): DecisionMap {
  return Object.fromEntries(
    preview.pantries.map((pantry) => {
      const nextOwner = pantry.members[0];

      return [
        pantry.id,
        nextOwner
          ? {
              pantryId: pantry.id,
              action: 'transfer',
              transferToUserId: nextOwner.userId,
            }
          : {
              pantryId: pantry.id,
              action: 'delete',
              transferToUserId: null,
            },
      ];
    })
  );
}

export function getProviderLabel(providers: string[]) {
  if (providers.includes('apple')) {
    return 'Apple';
  }

  if (providers.includes('google')) {
    return 'Google';
  }

  if (providers.includes('email')) {
    return 'email and password';
  }

  return null;
}

export function getProviderCleanupMessage(providers: string[]) {
  if (providers.includes('apple')) {
    return 'Deleting your Pantros account does not automatically remove Pantros from Sign in with Apple. After deletion, remove Pantros from your Apple account settings if you do not want that authorization to remain listed there.';
  }

  if (providers.includes('google')) {
    return 'Deleting your Pantros account does not automatically revoke Pantros access from your Google account. After deletion, remove Pantros from your Google connected apps settings if you do not want that authorization to remain there.';
  }

  return null;
}

export function areAllPantriesResolved(
  preview: AccountDeletionPreview | null,
  decisions: DecisionMap
) {
  if (!preview) {
    return false;
  }

  return preview.pantries.every((pantry) => {
    const decision = decisions[pantry.id];

    if (!decision) {
      return false;
    }

    if (decision.action === 'delete') {
      return true;
    }

    return pantry.members.some(
      (member) => member.userId === decision.transferToUserId
    );
  });
}
