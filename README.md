# Pearlbody.NG — Coming Soon

Landing page for **Pearlbody.NG** — a Nigerian fashion house (bespoke, bridal wears & silk,
skincare & cosmetics, all-round wellness) opening its digital doors on **21 October 2026**.

**Live:** https://pearlbody.vercel.app
(custom domain `pearlbody.ng` attached — pending DNS pointing, see below)

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion v12 (intro loader, masked letter reveals, rolling countdown digits,
  scroll parallax, magnetic buttons, cursor spotlight)
- Mailchimp (audience `5de0afd060`) via a serverless route handler

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Environment variables

Required (set in `.env.local` for local work, and in Vercel → Project → Settings → Environment Variables for production):

| Name | Description |
| --- | --- |
| `MAILCHIMP_API_KEY` | Mailchimp API key (`<key>-<datacenter>`) |
| `MAILCHIMP_AUDIENCE_ID` | Mailchimp audience/list id |

## What's on the page

- Intro loader with monogram reveal
- Hero: "Coming soon" masked letter animation, brand plate, cursor spotlight, scroll parallax
- Live countdown to 21 Oct 2026 (00:00 WAT) with rolling digits + progress bar
- Brand marquee (Quality · Professionalism · Reliability / services)
- Notify form → Mailchimp (`POST /api/subscribe`, honeypot + validation + tagging)
- Footer with atelier address, phones and TikTok — [@pearlbody.ng](https://www.tiktok.com/@pearlbody.ng)

## Roadmap (before launch)

- Fabric / style / measurement configurator
- Full multi-page atelier site

## Custom domain

`pearlbody.ng` and `www.pearlbody.ng` are attached to the Vercel project.
Until DNS is pointed at Vercel, use the working alias above.

Recommended DNS (at your registrar):

```text
A     pearlbody.ng      76.76.21.21
CNAME www.pearlbody.ng   cname.vercel-dns.com
```

Or switch nameservers to `ns1.vercel-dns.com` / `ns2.vercel-dns.com`.

---

© 2026 Pearlbody.NG — *...looks beyond words*
