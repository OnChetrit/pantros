import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.103.0";

type PantryDecision = {
  pantryId: string;
  action: "transfer" | "delete";
  transferToUserId?: string | null;
};

type RequestBody =
  | {
      operation: "preview";
    }
  | {
      operation: "delete";
      confirmation: string;
      decisions: PantryDecision[];
    };

type PantryRow = {
  id: string;
  name: string;
};

type MemberRow = {
  pantry_id: string;
  user_id: string;
  role: string;
  joined_at: string;
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
};

type ItemImageRow = {
  image: string | null;
};

const ITEM_IMAGE_BUCKET = "item-images";
const ITEM_IMAGE_CLEANUP_PAGE_SIZE = 500;
const ITEM_IMAGE_CLEANUP_BATCH_SIZE = 100;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}

function isPantryDecision(value: unknown): value is PantryDecision {
  if (!value || typeof value !== "object") {
    return false;
  }

  const decision = value as Record<string, unknown>;

  if (
    typeof decision.pantryId !== "string" ||
    !UUID_PATTERN.test(decision.pantryId) ||
    (decision.action !== "transfer" && decision.action !== "delete")
  ) {
    return false;
  }

  if (decision.action === "delete") {
    return decision.transferToUserId == null;
  }

  return (
    typeof decision.transferToUserId === "string" &&
    UUID_PATTERN.test(decision.transferToUserId)
  );
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const accessToken = getBearerToken(request);

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Supabase function secrets are unavailable");
    return jsonResponse({ error: "Server configuration is incomplete" }, 500);
  }

  if (!accessToken) {
    return jsonResponse({ error: "Authentication is required" }, 401);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(accessToken);

  if (userError || !user) {
    return jsonResponse({ error: "Your session is no longer valid" }, 401);
  }

  let body: RequestBody;

  try {
    body = await request.json() as RequestBody;
  } catch {
    return jsonResponse({ error: "A valid JSON body is required" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  if (body.operation === "preview") {
    const { data: pantryData, error: pantryError } = await admin
      .from("pantries")
      .select("id, name")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true });

    if (pantryError) {
      console.error("Unable to load owned pantries", pantryError);
      return jsonResponse({ error: "Unable to load account details" }, 500);
    }

    const pantries = (pantryData ?? []) as PantryRow[];
    const pantryIds = pantries.map((pantry) => pantry.id);
    let members: MemberRow[] = [];

    if (pantryIds.length > 0) {
      const { data: memberData, error: memberError } = await admin
        .from("pantry_members")
        .select("pantry_id, user_id, role, joined_at")
        .in("pantry_id", pantryIds)
        .neq("user_id", user.id)
        .order("joined_at", { ascending: true });

      if (memberError) {
        console.error("Unable to load pantry members", memberError);
        return jsonResponse({ error: "Unable to load account details" }, 500);
      }

      members = (memberData ?? []) as MemberRow[];
    }

    const memberUserIds = [...new Set(members.map((member) => member.user_id))];
    let profiles: ProfileRow[] = [];

    if (memberUserIds.length > 0) {
      const { data: profileData, error: profileError } = await admin
        .from("profiles")
        .select("id, email, full_name")
        .in("id", memberUserIds);

      if (profileError) {
        console.error("Unable to load member profiles", profileError);
        return jsonResponse({ error: "Unable to load account details" }, 500);
      }

      profiles = (profileData ?? []) as ProfileRow[];
    }

    const profileById = new Map(
      profiles.map((profile) => [profile.id, profile]),
    );

    return jsonResponse({
      pantries: pantries.map((pantry) => ({
        id: pantry.id,
        name: pantry.name,
        members: members
          .filter((member) => member.pantry_id === pantry.id)
          .map((member) => {
            const profile = profileById.get(member.user_id);

            return {
              userId: member.user_id,
              name: profile?.full_name ?? profile?.email ?? "Pantry member",
              email: profile?.email ?? "",
              role: member.role,
              joinedAt: member.joined_at,
            };
          }),
      })),
      joinedPantryCount: await getJoinedPantryCount(
        admin,
        user.id,
        new Set(pantryIds),
      ),
      providers: user.identities?.map((identity) => identity.provider) ?? [],
    });
  }

  if (
    body.operation !== "delete" ||
    body.confirmation !== "DELETE" ||
    !Array.isArray(body.decisions) ||
    !body.decisions.every(isPantryDecision)
  ) {
    return jsonResponse({ error: "The account deletion request is invalid" }, 400);
  }

  const uniquePantryIds = new Set(
    body.decisions.map((decision) => decision.pantryId),
  );

  if (uniquePantryIds.size !== body.decisions.length) {
    return jsonResponse(
      { error: "Each pantry can have only one deletion decision" },
      400,
    );
  }

  const databaseDecisions = body.decisions.map((decision) => ({
    pantry_id: decision.pantryId,
    action: decision.action,
    transfer_to_user_id: decision.action === "transfer"
      ? decision.transferToUserId
      : null,
  }));
  const deletedPantryIds = databaseDecisions
    .filter((decision) => decision.action === "delete")
    .map((decision) => decision.pantry_id);

  const { error: prepareError } = await admin.rpc(
    "prepare_account_deletion",
    {
      p_user_id: user.id,
      p_decisions: databaseDecisions,
    },
  );

  if (prepareError) {
    console.error("Unable to prepare account deletion", prepareError);
    return jsonResponse(
      {
        error:
          "Pantry membership changed. Refresh the deletion screen and try again.",
      },
      409,
    );
  }

  let deletedPantryImagePaths: string[];

  try {
    deletedPantryImagePaths = await getItemImageStoragePaths(
      admin,
      deletedPantryIds,
      supabaseUrl,
    );
  } catch (error) {
    console.error("Unable to collect item image cleanup paths", error);
    return jsonResponse({ error: "Unable to prepare account cleanup" }, 500);
  }

  const { error: signOutError } = await admin.auth.admin.signOut(
    accessToken,
    "global",
  );

  if (signOutError) {
    console.error("Unable to revoke account sessions", signOutError);
    return jsonResponse({ error: "Unable to revoke account sessions" }, 500);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error("Unable to delete account", deleteError);
    return jsonResponse(
      {
        error:
          "The account could not be deleted. Refresh the deletion screen and try again.",
      },
      409,
    );
  }

  await removeItemImageStorageObjects(admin, deletedPantryImagePaths);

  return jsonResponse({ deleted: true });
});

async function getJoinedPantryCount(
  admin: ReturnType<typeof createClient>,
  userId: string,
  ownedPantryIds: Set<string>,
) {
  const { data, error } = await admin
    .from("pantry_members")
    .select("pantry_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Unable to count joined pantries", error);
    return 0;
  }

  return (data ?? []).filter(
    (membership) => !ownedPantryIds.has(membership.pantry_id),
  ).length;
}

async function getItemImageStoragePaths(
  admin: ReturnType<typeof createClient>,
  deletedPantryIds: string[],
  supabaseUrl: string,
) {
  if (deletedPantryIds.length === 0) {
    return [];
  }

  const pantryIdSet = new Set(deletedPantryIds);
  const paths = new Set<string>();
  let offset = 0;

  while (true) {
    const { data, error } = await admin
      .from("items")
      .select("image")
      .in("pantry_id", deletedPantryIds)
      .range(offset, offset + ITEM_IMAGE_CLEANUP_PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as ItemImageRow[];

    for (const row of rows) {
      const path = extractItemImageStoragePath(
        row.image,
        supabaseUrl,
        pantryIdSet,
      );

      if (path) {
        paths.add(path);
      }
    }

    if (rows.length < ITEM_IMAGE_CLEANUP_PAGE_SIZE) {
      break;
    }

    offset += ITEM_IMAGE_CLEANUP_PAGE_SIZE;
  }

  return [...paths];
}

function extractItemImageStoragePath(
  value: string | null,
  supabaseUrl: string,
  deletedPantryIds: Set<string>,
) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const directPath = normalizeItemImageStoragePath(trimmed);

  if (directPath) {
    return isDeletedPantryStoragePath(directPath, deletedPantryIds)
      ? directPath
      : null;
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  let supabaseOrigin: string;

  try {
    supabaseOrigin = new URL(supabaseUrl).origin;
  } catch {
    return null;
  }

  if (url.origin !== supabaseOrigin) {
    return null;
  }

  const storagePrefixes = [
    `/storage/v1/object/${ITEM_IMAGE_BUCKET}/`,
    `/storage/v1/object/public/${ITEM_IMAGE_BUCKET}/`,
    `/storage/v1/object/sign/${ITEM_IMAGE_BUCKET}/`,
    `/storage/v1/object/authenticated/${ITEM_IMAGE_BUCKET}/`,
    `/storage/v1/render/image/public/${ITEM_IMAGE_BUCKET}/`,
    `/storage/v1/render/image/sign/${ITEM_IMAGE_BUCKET}/`,
    `/storage/v1/render/image/authenticated/${ITEM_IMAGE_BUCKET}/`,
  ];

  for (const prefix of storagePrefixes) {
    if (url.pathname.startsWith(prefix)) {
      const path = decodeStoragePath(url.pathname.slice(prefix.length));

      return isDeletedPantryStoragePath(path, deletedPantryIds) ? path : null;
    }
  }

  return null;
}

function normalizeItemImageStoragePath(value: string) {
  if (
    value.startsWith("file:") ||
    value.startsWith("content:") ||
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("ph:") ||
    value.startsWith("assets-library:")
  ) {
    return null;
  }

  const withoutBucketPrefix = value.startsWith(`${ITEM_IMAGE_BUCKET}/`)
    ? value.slice(`${ITEM_IMAGE_BUCKET}/`.length)
    : value;

  if (
    withoutBucketPrefix.startsWith("/") ||
    withoutBucketPrefix.includes("://") ||
    withoutBucketPrefix.split("/").includes("..")
  ) {
    return null;
  }

  return decodeStoragePath(withoutBucketPrefix);
}

function decodeStoragePath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isDeletedPantryStoragePath(
  path: string,
  deletedPantryIds: Set<string>,
) {
  return [...deletedPantryIds].some((pantryId) =>
    path === pantryId || path.startsWith(`${pantryId}/`)
  );
}

async function removeItemImageStorageObjects(
  admin: ReturnType<typeof createClient>,
  paths: string[],
) {
  for (
    let index = 0;
    index < paths.length;
    index += ITEM_IMAGE_CLEANUP_BATCH_SIZE
  ) {
    const batch = paths.slice(index, index + ITEM_IMAGE_CLEANUP_BATCH_SIZE);
    const { error } = await admin.storage.from(ITEM_IMAGE_BUCKET).remove(batch);

    if (error) {
      console.error("Unable to remove item image storage objects", {
        paths: batch,
        error,
      });
    }
  }
}
