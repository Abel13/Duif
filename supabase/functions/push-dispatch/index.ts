import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { authorizeCronRequest } from "../_shared/cron-auth.ts";

const jsonHeaders = { "Content-Type": "application/json" };

type ClaimedPushRow = {
  outbox_id: string;
  profile_id: string;
  event_kind: string;
  title: string;
  body: string;
  deep_link: string;
  locale: string;
  payload_public: Record<string, unknown>;
  subscription_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

Deno.serve(async (request) => {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const cronSecret = Deno.env.get("PUSH_DISPATCH_CRON_SECRET") ?? "";
  const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:ops@duif.app";

  const authorization = await authorizeCronRequest({
    method: request.method,
    providedSecret: request.headers.get("X-Duif-Cron-Secret"),
    expectedSecret: cronSecret,
    internalConfigurationReady: Boolean(url && serviceKey && vapidPublic && vapidPrivate),
  });
  if (authorization) return response({ error: authorization.error }, authorization.status);

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  await admin.rpc("enqueue_postal_push_events", { reference_time: new Date().toISOString() });

  const { data, error } = await admin.rpc("claim_pending_push_outbox", { batch_limit: 50 });
  if (error) return response({ error: "claim_failed" }, 500);

  const rows = (data ?? []) as ClaimedPushRow[];
  let sent = 0;
  let failed = 0;
  let revoked = 0;
  const seenOutbox = new Set<string>();

  for (const row of rows) {
    const payload = JSON.stringify({
      title: row.title,
      body: row.body,
      deepLink: row.deep_link,
      eventKind: row.event_kind,
      locale: row.locale,
      ...row.payload_public,
    });

    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        payload,
        { TTL: 60 * 60 },
      );
      if (!seenOutbox.has(row.outbox_id)) {
        const { error: sentError } = await admin.rpc("mark_push_outbox_sent", {
          target_outbox_id: row.outbox_id,
        });
        if (sentError) throw sentError;
        seenOutbox.add(row.outbox_id);
        sent += 1;
      }
    } catch (cause) {
      const statusCode = readStatusCode(cause);
      failed += 1;
      if (statusCode === 404 || statusCode === 410) {
        await admin.rpc("revoke_push_subscription_endpoint", {
          subscription_endpoint: row.endpoint,
        });
        revoked += 1;
        await admin.rpc("mark_push_outbox_failed", {
          target_outbox_id: row.outbox_id,
          error_message: `gone:${statusCode}`,
          permanent: false,
        });
      } else {
        await admin.rpc("mark_push_outbox_failed", {
          target_outbox_id: row.outbox_id,
          error_message: statusCode ? `http:${statusCode}` : "push_failed",
          permanent: false,
        });
      }
    }
  }

  return response({ claimed: rows.length, sent, failed, revoked });
});

function readStatusCode(cause: unknown) {
  if (typeof cause === "object" && cause !== null && "statusCode" in cause) {
    const value = (cause as { statusCode?: unknown }).statusCode;
    return typeof value === "number" ? value : undefined;
  }
  return undefined;
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}
