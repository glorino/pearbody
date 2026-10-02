import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return NextResponse.json(
      { ok: false, error: "Subscription service is not configured yet." },
      { status: 503 },
    );
  }

  let payload: { email?: string; name?: string; source?: string; company?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (payload.company) {
    return NextResponse.json({ ok: true });
  }

  const email = (payload.email ?? "").trim().toLowerCase();
  const name = (payload.name ?? "").trim().slice(0, 60);
  const source = (payload.source ?? "pearlbody-landing").slice(0, 60);

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const [key, datacenter] = apiKey.split("-");
  if (!key || !datacenter) {
    return NextResponse.json(
      { ok: false, error: "Subscription service is misconfigured." },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(
      `https://${datacenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: "subscribed",
          merge_fields: { FNAME: name },
          tags: ["coming-soon", source],
        }),
        cache: "no-store",
      },
    );

    const data = (await res.json().catch(() => null)) as
      | { title?: string; detail?: string; errors?: { message?: string }[] }
      | null;

    if (res.ok) {
      // Mailchimp identifies members by MD5 of the lowercase email.
      const { createHash } = await import("node:crypto");
      const md5 = createHash("md5").update(email.toLowerCase()).digest("hex");

      await fetch(
        `https://${datacenter}.api.mailchimp.com/3.0/lists/${audienceId}/members/${md5}/tags`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tags: ["coming-soon", source] }),
          cache: "no-store",
        },
      ).catch(() => null);

      return NextResponse.json({ ok: true });
    }

    if (data?.title === "Member Exists") {
      return NextResponse.json({ ok: true, already: true });
    }

    const detail =
      data?.errors?.[0]?.message ||
      data?.detail ||
      "We couldn't add you right now. Please try again.";

    return NextResponse.json({ ok: false, error: detail }, { status: 400 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Network error — please try again." },
      { status: 500 },
    );
  }
}
