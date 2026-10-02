import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getPool, listSignups } from "@/lib/db";

interface MailchimpMember {
  email_address: string;
  status: string;
}

function mailchimpConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  if (!apiKey || !audienceId) return null;
  const [key, datacenter] = apiKey.split("-");
  if (!key || !datacenter) return null;
  return { apiKey, audienceId, key, datacenter };
}

async function fetchMembers(cfg: NonNullable<ReturnType<typeof mailchimpConfig>>) {
  const res = await fetch(
    `https://${cfg.datacenter}.api.mailchimp.com/3.0/lists/${cfg.audienceId}/members?count=1000&fields=members.email_address,members.status&status=subscribed,pending,unsubscribed,cleaned`,
    {
      headers: { Authorization: `Bearer ${cfg.apiKey}` },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mailchimp responded ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as { members?: MailchimpMember[] };
  return data.members ?? [];
}

/** GET — compare Neon signups against the Mailchimp audience. */
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const cfg = mailchimpConfig();
  if (!cfg) {
    return NextResponse.json({ ok: false, error: "Mailchimp is not configured." }, { status: 503 });
  }

  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ ok: false, error: "Database is not configured." }, { status: 503 });
  }

  try {
    const [dbRows, members] = await Promise.all([listSignups(pool), fetchMembers(cfg)]);
    const mcMap = new Map(members.map((m) => [m.email_address.toLowerCase(), m.status]));

    const items = dbRows.map((row) => {
      const status = mcMap.get(row.email.toLowerCase()) ?? null;
      return { email: row.email, name: row.name, source: row.source, created_at: row.created_at, mailchimp: status };
    });

    const synced = items.filter((i) => i.mailchimp !== null).length;
    const missing = items.length - synced;

    return NextResponse.json({
      ok: true,
      audienceId: cfg.audienceId,
      items,
      stats: { total: items.length, synced, missing, inMailchimp: members.length },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Sync check failed." },
      { status: 502 },
    );
  }
}

/** POST — add the given (or all missing) DB signups to Mailchimp. */
export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const cfg = mailchimpConfig();
  if (!cfg) {
    return NextResponse.json({ ok: false, error: "Mailchimp is not configured." }, { status: 503 });
  }

  let payload: { emails?: unknown } = {};
  try {
    payload = await request.json();
  } catch {
    // Empty body → sync everything that is missing.
  }

  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ ok: false, error: "Database is not configured." }, { status: 503 });
  }

  try {
    const dbRows = await listSignups(pool);
    const members = await fetchMembers(cfg);
    const inMc = new Set(members.map((m) => m.email_address.toLowerCase()));

    const requested = Array.isArray(payload.emails)
      ? (payload.emails as unknown[]).map((e) => String(e).toLowerCase())
      : null;

    const targets = dbRows.filter((row) => {
      if (inMc.has(row.email.toLowerCase())) return false;
      if (requested && !requested.includes(row.email.toLowerCase())) return false;
      return true;
    });

    const results = { synced: 0, failed: 0, errors: [] as { email: string; error: string }[] };

    for (const row of targets) {
      try {
        const res = await fetch(
          `https://${cfg.datacenter}.api.mailchimp.com/3.0/lists/${cfg.audienceId}/members`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              email_address: row.email,
              status: "subscribed",
              merge_fields: { FNAME: row.name ?? "" },
              tags: ["coming-soon", row.source || "pearlbody-landing"],
            }),
            cache: "no-store",
          },
        );
        const data = (await res.json().catch(() => null)) as { title?: string } | null;
        if (res.ok || data?.title === "Member Exists") results.synced++;
        else {
          results.failed++;
          results.errors.push({ email: row.email, error: data?.title || `HTTP ${res.status}` });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ email: row.email, error: error instanceof Error ? error.message : "network error" });
      }
    }

    return NextResponse.json({ ok: true, considered: targets.length, ...results });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Sync failed." },
      { status: 502 },
    );
  }
}
