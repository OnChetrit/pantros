import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.103.0";

type ClaimedReminder = {
  delivery_id: string;
  user_id: string;
  local_date: string;
  item_count: number;
  pantry_count: number;
  expo_push_tokens: string[];
};

type ExpoPushTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
};

type DeliveryResult = {
  okCount: number;
  errors: string[];
  ticketIds: string[];
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_BATCH_SIZE = 100;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function chunk<T>(values: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

function getNotificationBody(reminder: ClaimedReminder) {
  const itemLabel = reminder.item_count === 1 ? "item is" : "items are";
  const pantrySuffix = reminder.pantry_count > 1
    ? ` across ${reminder.pantry_count} pantries`
    : "";

  return `${reminder.item_count} ${itemLabel} waiting in your cart${pantrySuffix}.`;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const expectedCronSecret = Deno.env.get("CART_REMINDER_CRON_SECRET");
  const receivedCronSecret = request.headers.get("x-cron-secret");

  if (!expectedCronSecret || receivedCronSecret !== expectedCronSecret) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Supabase function secrets are unavailable");
    return jsonResponse({ error: "Server configuration is incomplete" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.rpc("claim_due_cart_reminders");

  if (error) {
    console.error("Unable to claim cart reminders", error);
    return jsonResponse({ error: "Unable to claim cart reminders" }, 500);
  }

  const reminders = (data ?? []) as ClaimedReminder[];

  if (reminders.length === 0) {
    return jsonResponse({ claimed: 0, sent: 0 });
  }

  const messages = reminders.flatMap((reminder) =>
    reminder.expo_push_tokens.map((token) => ({
      deliveryId: reminder.delivery_id,
      token,
      message: {
        to: token,
        sound: "default",
        channelId: "cart-reminders",
        title: "Items are waiting in your cart",
        body: getNotificationBody(reminder),
        data: {
          route: "/(tabs)/cart",
        },
      },
    }))
  );

  const deliveryResults = new Map<string, DeliveryResult>();

  for (const reminder of reminders) {
    deliveryResults.set(reminder.delivery_id, {
      okCount: 0,
      errors: [],
      ticketIds: [],
    });
  }

  for (const messageBatch of chunk(messages, EXPO_BATCH_SIZE)) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBatch.map((entry) => entry.message)),
      });

      if (!response.ok) {
        throw new Error(`Expo Push API returned ${response.status}`);
      }

      const payload = await response.json() as { data?: ExpoPushTicket[] };
      const tickets = payload.data ?? [];

      for (let index = 0; index < messageBatch.length; index += 1) {
        const entry = messageBatch[index];
        const ticket = tickets[index];
        const result = deliveryResults.get(entry.deliveryId);

        if (!result) {
          continue;
        }

        if (ticket?.status === "ok") {
          result.okCount += 1;

          if (ticket.id) {
            result.ticketIds.push(ticket.id);
          }

          continue;
        }

        const errorCode = ticket?.details?.error;
        const errorMessage = ticket?.message ?? errorCode ?? "Expo rejected the notification";
        result.errors.push(errorMessage);

        if (errorCode === "DeviceNotRegistered") {
          const { error: tokenError } = await supabase
            .from("push_tokens")
            .update({
              active: false,
              last_seen_at: new Date().toISOString(),
            })
            .eq("expo_push_token", entry.token);

          if (tokenError) {
            console.error("Unable to deactivate push token", tokenError);
          }
        }
      }
    } catch (batchError) {
      const message = batchError instanceof Error
        ? batchError.message
        : "Expo Push API request failed";

      for (const entry of messageBatch) {
        deliveryResults.get(entry.deliveryId)?.errors.push(message);
      }
    }
  }

  let sentCount = 0;

  for (const reminder of reminders) {
    const result = deliveryResults.get(reminder.delivery_id);
    const sent = Boolean(result?.okCount);

    if (sent) {
      sentCount += 1;
    }

    const { error: updateError } = await supabase
      .from("notification_deliveries")
      .update({
        status: sent ? "sent" : "failed",
        expo_ticket_ids: result?.ticketIds ?? [],
        error_message: result?.errors.length
          ? result.errors.join("; ").slice(0, 2000)
          : null,
        updated_at: new Date().toISOString(),
        sent_at: sent ? new Date().toISOString() : null,
      })
      .eq("id", reminder.delivery_id);

    if (updateError) {
      console.error("Unable to update notification delivery", updateError);
    }
  }

  return jsonResponse({
    claimed: reminders.length,
    sent: sentCount,
    failed: reminders.length - sentCount,
  });
});
