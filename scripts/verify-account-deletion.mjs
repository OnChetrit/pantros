import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error(
    'SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are required.'
  );
}

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
const password = `Plan01-${suffix}-Aa9!`;
const testUsers = new Map();
const uploadedItemImagePaths = new Set();
const itemImageBucketId = 'item-images';
const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64'
);

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
const itemImageStorage = adminClient.storage.from(itemImageBucketId);
let itemImageBucketEnsured = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchWithRetry(url, init = {}, attempts = 4) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, init);

      if (response.status < 500 || attempt === attempts) {
        return response;
      }

      await sleep(250 * attempt);
    } catch (error) {
      lastError = error;

      if (attempt === attempts) {
        break;
      }

      await sleep(250 * attempt);
    }
  }

  throw lastError;
}

async function requestJson(url, init = {}, acceptedStatuses = [200, 201]) {
  const response = await fetchWithRetry(url, init);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!acceptedStatuses.includes(response.status)) {
    const detail =
      payload?.error_description ??
      payload?.msg ??
      payload?.message ??
      payload?.error ??
      text ??
      `HTTP ${response.status}`;
    throw new Error(`${detail} (${response.status})`);
  }

  return {
    payload,
    status: response.status,
  };
}

function adminHeaders() {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };
}

function userHeaders(accessToken) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

function storageErrorMessage(error) {
  return error?.message ?? JSON.stringify(error);
}

async function ensureItemImageBucket() {
  if (itemImageBucketEnsured) {
    return;
  }

  const { data, error } = await adminClient.storage.listBuckets();

  if (error) {
    throw new Error(
      `Unable to list Storage buckets: ${storageErrorMessage(error)}`
    );
  }

  if (
    (data ?? []).some(
      (bucket) =>
        bucket.id === itemImageBucketId || bucket.name === itemImageBucketId
    )
  ) {
    itemImageBucketEnsured = true;
    return;
  }

  const { error: createError } = await adminClient.storage.createBucket(
    itemImageBucketId,
    {
      public: false,
    }
  );

  if (createError && !/already exists/i.test(createError.message ?? '')) {
    throw new Error(
      `Unable to create ${itemImageBucketId} bucket: ${storageErrorMessage(createError)}`
    );
  }

  itemImageBucketEnsured = true;
}

async function uploadItemImage(path) {
  await ensureItemImageBucket();

  const { error } = await itemImageStorage.upload(
    path,
    new Blob([tinyPng], { type: 'image/png' }),
    {
      contentType: 'image/png',
      upsert: true,
    }
  );

  if (error) {
    throw new Error(
      `Unable to upload item image fixture: ${storageErrorMessage(error)}`
    );
  }

  uploadedItemImagePaths.add(path);
}

async function itemImageExists(path) {
  await ensureItemImageBucket();

  const slashIndex = path.lastIndexOf('/');
  const folder = slashIndex >= 0 ? path.slice(0, slashIndex) : '';
  const name = slashIndex >= 0 ? path.slice(slashIndex + 1) : path;
  const { data, error } = await itemImageStorage.list(folder, {
    limit: 100,
    search: name,
  });

  if (error) {
    throw new Error(
      `Unable to inspect item image fixture: ${storageErrorMessage(error)}`
    );
  }

  return (data ?? []).some((entry) => entry.name === name && entry.id !== null);
}

async function removeItemImageIfExists(path) {
  await ensureItemImageBucket();

  const { error } = await itemImageStorage.remove([path]);

  if (error) {
    throw new Error(
      `Unable to remove item image fixture: ${storageErrorMessage(error)}`
    );
  }

  uploadedItemImagePaths.delete(path);
}

async function createUser(label) {
  const email = `codex-plan01-${label}-${suffix}@example.com`;
  const { payload } = await requestJson(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: `Plan 01 ${label}`,
      },
    }),
  });

  const user = {
    id: payload.id,
    email,
    label,
    accessToken: null,
  };

  testUsers.set(user.id, user);

  await requestJson(
    `${supabaseUrl}/rest/v1/profiles?on_conflict=id`,
    {
      method: 'POST',
      headers: {
        ...adminHeaders(),
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        full_name: `Plan 01 ${label}`,
      }),
    },
    [200, 201, 204]
  );

  const { payload: session } = await requestJson(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  user.accessToken = session.access_token;
  return user;
}

async function restSelect(table, query) {
  const { payload } = await requestJson(
    `${supabaseUrl}/rest/v1/${table}?${query}`,
    {
      headers: adminHeaders(),
    }
  );

  return payload;
}

async function restInsert(table, value, onConflict) {
  const conflictQuery = onConflict
    ? `?on_conflict=${encodeURIComponent(onConflict)}`
    : '';

  await requestJson(
    `${supabaseUrl}/rest/v1/${table}${conflictQuery}`,
    {
      method: 'POST',
      headers: {
        ...adminHeaders(),
        Prefer: onConflict
          ? 'resolution=merge-duplicates,return=minimal'
          : 'return=minimal',
      },
      body: JSON.stringify(value),
    },
    [200, 201, 204]
  );
}

async function userRestInsert(accessToken, table, value, onConflict) {
  const conflictQuery = onConflict
    ? `?on_conflict=${encodeURIComponent(onConflict)}`
    : '';

  await requestJson(
    `${supabaseUrl}/rest/v1/${table}${conflictQuery}`,
    {
      method: 'POST',
      headers: {
        ...userHeaders(accessToken),
        Prefer: onConflict
          ? 'resolution=merge-duplicates,return=minimal'
          : 'return=minimal',
      },
      body: JSON.stringify(value),
    },
    [200, 201, 204]
  );
}

async function userRpc(accessToken, functionName, body) {
  await requestJson(
    `${supabaseUrl}/rest/v1/rpc/${functionName}`,
    {
      method: 'POST',
      headers: userHeaders(accessToken),
      body: JSON.stringify(body),
    },
    [200, 204]
  );
}

async function restDelete(table, query) {
  await requestJson(
    `${supabaseUrl}/rest/v1/${table}?${query}`,
    {
      method: 'DELETE',
      headers: {
        ...adminHeaders(),
        Prefer: 'return=minimal',
      },
    },
    [200, 204]
  );
}

async function getOwnedPantries(userId) {
  return restSelect(
    'pantries',
    `owner_id=eq.${userId}&select=id,name,owner_id&order=created_at.asc`
  );
}

async function invokeDeletionFunction(accessToken, body, acceptedStatuses = [200]) {
  return requestJson(
    `${supabaseUrl}/functions/v1/delete-account`,
    {
      method: 'POST',
      headers: userHeaders(accessToken),
      body: JSON.stringify(body),
    },
    acceptedStatuses
  );
}

async function getDeletionPreview(user) {
  const { payload } = await invokeDeletionFunction(user.accessToken, {
    operation: 'preview',
  });

  return payload;
}

async function deleteAccount(user, decisions, acceptedStatuses = [200]) {
  return invokeDeletionFunction(
    user.accessToken,
    {
      operation: 'delete',
      confirmation: 'DELETE',
      decisions,
    },
    acceptedStatuses
  );
}

async function authUserExists(userId) {
  const response = await fetchWithRetry(
    `${supabaseUrl}/auth/v1/admin/users/${userId}`,
    {
      headers: adminHeaders(),
    }
  );

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw new Error(`Unable to inspect Auth user ${userId}: ${response.status}`);
  }

  return true;
}

async function cleanupUser(user) {
  if (!user || !(await authUserExists(user.id))) {
    return;
  }

  const pantries = await getOwnedPantries(user.id);
  const decisions = pantries.map((pantry) => ({
    pantry_id: pantry.id,
    action: 'delete',
    transfer_to_user_id: null,
  }));

  await requestJson(
    `${supabaseUrl}/rest/v1/rpc/prepare_account_deletion`,
    {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({
        p_user_id: user.id,
        p_decisions: decisions,
      }),
    },
    [200, 204]
  );

  await requestJson(
    `${supabaseUrl}/auth/v1/admin/users/${user.id}`,
    {
      method: 'DELETE',
      headers: adminHeaders(),
    },
    [200]
  );
}

async function verifyTransferFlow() {
  const owner = await createUser('transfer-owner');
  const recipient = await createUser('transfer-recipient');
  const ownerPantries = await getOwnedPantries(owner.id);
  const recipientPantries = await getOwnedPantries(recipient.id);

  assert(ownerPantries.length === 1, 'Transfer owner should start with one pantry.');
  assert(
    recipientPantries.length === 1,
    'Transfer recipient should start with one pantry.'
  );

  const pantry = ownerPantries[0];

  await restInsert(
    'pantry_members',
    {
      pantry_id: pantry.id,
      user_id: recipient.id,
      role: 'member',
    },
    'pantry_id,user_id'
  );

  const carts = await restSelect(
    'carts',
    `pantry_id=eq.${pantry.id}&select=id&order=created_at.asc`
  );

  await restInsert('items', {
    pantry_id: pantry.id,
    cart_id: carts[0]?.id ?? null,
    name: `Transfer item ${suffix}`,
    is_in_cart: false,
    quantity: 1,
  });

  await userRestInsert(
    owner.accessToken,
    'notification_preferences',
    {
      user_id: owner.id,
      cart_reminders_enabled: true,
      cart_reminder_time: '18:00',
      time_zone: 'UTC',
    },
    'user_id'
  );

  await userRpc(owner.accessToken, 'register_push_token', {
    p_expo_push_token: `ExpoPushToken[Plan01_${suffix.replaceAll('-', '_')}]`,
    p_platform: 'ios',
  });

  const preview = await getDeletionPreview(owner);
  const previewPantry = preview.pantries.find((entry) => entry.id === pantry.id);

  assert(previewPantry, 'Preview should include the owned pantry.');
  assert(
    previewPantry.members.some((member) => member.userId === recipient.id),
    'Preview should offer the recipient as an ownership target.'
  );

  await restDelete(
    'pantry_members',
    `pantry_id=eq.${pantry.id}&user_id=eq.${recipient.id}`
  );

  const failedTransfer = await deleteAccount(
    owner,
    [
      {
        pantryId: pantry.id,
        action: 'transfer',
        transferToUserId: recipient.id,
      },
    ],
    [409]
  );

  assert(
    typeof failedTransfer.payload?.error === 'string',
    'A stale transfer target should return a conflict.'
  );
  assert(
    await authUserExists(owner.id),
    'The owner must remain after a stale transfer conflict.'
  );

  await restInsert(
    'pantry_members',
    {
      pantry_id: pantry.id,
      user_id: recipient.id,
      role: 'member',
    },
    'pantry_id,user_id'
  );

  await deleteAccount(owner, [
    {
      pantryId: pantry.id,
      action: 'transfer',
      transferToUserId: recipient.id,
    },
  ]);

  assert(!(await authUserExists(owner.id)), 'Transferred owner should be deleted.');
  testUsers.delete(owner.id);

  const transferredPantry = await restSelect(
    'pantries',
    `id=eq.${pantry.id}&select=id,owner_id`
  );
  const transferredMembership = await restSelect(
    'pantry_members',
    `pantry_id=eq.${pantry.id}&user_id=eq.${recipient.id}&select=role`
  );
  const preservedItems = await restSelect(
    'items',
    `pantry_id=eq.${pantry.id}&select=id`
  );
  const removedProfile = await restSelect(
    'profiles',
    `id=eq.${owner.id}&select=id`
  );
  const removedPreferences = await restSelect(
    'notification_preferences',
    `user_id=eq.${owner.id}&select=user_id`
  );
  const removedTokens = await restSelect(
    'push_tokens',
    `user_id=eq.${owner.id}&select=id`
  );

  assert(
    transferredPantry[0]?.owner_id === recipient.id,
    'The selected recipient should own the transferred pantry.'
  );
  assert(
    transferredMembership[0]?.role === 'owner',
    'The selected recipient membership should be promoted to owner.'
  );
  assert(preservedItems.length === 1, 'Transferred pantry items should be preserved.');
  assert(removedProfile.length === 0, 'Deleted profile should be removed.');
  assert(
    removedPreferences.length === 0,
    'Deleted notification preferences should be removed.'
  );
  assert(removedTokens.length === 0, 'Deleted push tokens should be removed.');

  return recipient;
}

async function verifyDeleteFlow() {
  const owner = await createUser('delete-owner');
  const pantries = await getOwnedPantries(owner.id);

  assert(pantries.length === 1, 'Delete owner should start with one pantry.');

  const pantry = pantries[0];
  const itemImagePath = `${pantry.id}/delete-${suffix}.png`;
  const carts = await restSelect(
    'carts',
    `pantry_id=eq.${pantry.id}&select=id&order=created_at.asc`
  );

  await uploadItemImage(itemImagePath);
  assert(
    await itemImageExists(itemImagePath),
    'Item image fixture should be uploaded.'
  );

  await restInsert('items', {
    pantry_id: pantry.id,
    cart_id: carts[0]?.id ?? null,
    name: `Delete item ${suffix}`,
    image: itemImagePath,
    is_in_cart: true,
    quantity: 2,
  });

  const preview = await getDeletionPreview(owner);
  const previewPantry = preview.pantries.find((entry) => entry.id === pantry.id);

  assert(previewPantry, 'Delete preview should include the owned pantry.');
  assert(
    previewPantry.members.length === 0,
    'A single-member pantry should not offer a transfer target.'
  );

  await deleteAccount(owner, [
    {
      pantryId: pantry.id,
      action: 'delete',
      transferToUserId: null,
    },
  ]);

  assert(!(await authUserExists(owner.id)), 'Delete owner should be removed.');
  testUsers.delete(owner.id);

  const deletedPantry = await restSelect(
    'pantries',
    `id=eq.${pantry.id}&select=id`
  );
  const deletedItems = await restSelect(
    'items',
    `pantry_id=eq.${pantry.id}&select=id`
  );
  const deletedCarts = await restSelect(
    'carts',
    `pantry_id=eq.${pantry.id}&select=id`
  );

  assert(deletedPantry.length === 0, 'Selected pantry should be deleted.');
  assert(deletedItems.length === 0, 'Deleted pantry items should be removed.');
  assert(deletedCarts.length === 0, 'Deleted pantry carts should be removed.');
  assert(
    !(await itemImageExists(itemImagePath)),
    'Deleted pantry item images should be removed from Storage.'
  );
  uploadedItemImagePaths.delete(itemImagePath);
}

async function verifyMultiplePantryRequirement(recipient) {
  const preview = await getDeletionPreview(recipient);

  assert(
    preview.pantries.length === 2,
    'The transfer recipient should own the original and transferred pantries.'
  );

  await deleteAccount(
    recipient,
    [
      {
        pantryId: preview.pantries[0].id,
        action: 'delete',
        transferToUserId: null,
      },
    ],
    [409]
  );

  assert(
    await authUserExists(recipient.id),
    'An incomplete multi-pantry request must not delete the account.'
  );

  await deleteAccount(
    recipient,
    preview.pantries.map((pantry) => ({
      pantryId: pantry.id,
      action: 'delete',
      transferToUserId: null,
    }))
  );

  assert(
    !(await authUserExists(recipient.id)),
    'Recipient cleanup should delete the account after resolving every pantry.'
  );
  testUsers.delete(recipient.id);
}

try {
  console.log('Creating temporary users and testing ownership transfer…');
  const recipient = await verifyTransferFlow();

  console.log('Testing permanent pantry deletion…');
  await verifyDeleteFlow();

  console.log('Testing multiple-owned-pantry validation and cleanup…');
  await verifyMultiplePantryRequirement(recipient);

  console.log('Account deletion integration test passed.');
} finally {
  for (const user of [...testUsers.values()]) {
    try {
      await cleanupUser(user);
    } catch (error) {
      console.error(`Cleanup failed for temporary ${user.label}:`, error);
    }
  }

  for (const path of [...uploadedItemImagePaths]) {
    try {
      await removeItemImageIfExists(path);
    } catch (error) {
      console.error(`Cleanup failed for temporary item image ${path}:`, error);
    }
  }
}
