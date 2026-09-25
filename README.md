# Retired

> Clean, lightweight parked/decommissioned domain page with Server-Side Rendered (SSR) RDAP data, powered by Elysia.

Live demo: [expy.my.id](https://expy.my.id)

---

## Features

- **Zero-JS Client Hydration Needed**: RDAP information is fetched and rendered server-side on first request.
- **Dynamic Host & Query Detection**: Resolves RDAP based on the request `Host` header or manual query parameter (`?domain=example.id`).
- **Direct IANA RDAP Bootstrap**: Queries official IANA bootstrap endpoints (`data.iana.org/rdap/dns.json`) with automatic fallback to `rdap.org`.
- **RDAP Information Display**:
  - Domain status & registry handle
  - Registrar & abuse contact details
  - DNSSEC status (Signed / Unsigned)
  - Critical lifecycle dates (Registration, Expiration, Last Changed)
  - Delegated nameservers
- **REST API Endpoint**: Serves normalized RDAP JSON via `/api/rdap?domain=<domain>`.
- **Edge Performance**: Built on Bun and designed for instant edge response.

---

## Roadmap & Milestone: Vercel Migration & Community Domains

Kami sedang dalam proses migrasi deployment ke **Vercel** agar siapa pun dapat dengan mudah memarkirkan atau menghubungkan domain mereka ke Retired secara terpusat.

### Ingin Memarkirkan Domain Anda di Retired?

Setelah migrasi selesai, Anda dapat mendaftarkan domain Anda ke instance publik Retired melalui Pull Request:

1. **Format Pendaftaran**:
   Tambahkan domain Anda ke file daftar domain (`domains.txt`), satu domain per baris:
   ```text
   example.com
   mybrand.co.id
   oldproject.my.id
   ```

2. **Aturan Domain yang Didukung**:
   - **Hanya mendukung domain TLD atau ccTLD / coTLD** (apex domain, seperti `example.com`, `domain.id`, `project.co.id`, `expy.my.id`).
   - **Subdomain TIDAK didukung** (misalnya `blog.example.com` atau `app.mybrand.id` akan ditolak).

3. **Konfigurasi DNS**:
   Arahkan DNS domain Anda menggunakan salah satu opsi berikut:
   - **CNAME (dengan flattening / ALIAS / ANAME)**:
     ```text
     CNAME  @  cname.vercel-dns.com.
     ```
   - **A Record**:
     ```text
     A      @  76.76.21.21
     ```

4. **Kirimkan Pull Request**:
   Buka PR ke repository ini. Setelah PR di-merge, domain Anda akan otomatis diverifikasi dan menampilkan halaman Retired dengan data RDAP yang sesuai.

---

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [ElysiaJS](https://elysiajs.com) with `@elysiajs/html`
- **Target Deployment**: [Vercel](https://vercel.com) (sebelumnya Cloudflare Workers)
- **Testing**: `node:test` executed with `bun test`

---

## Project Structure

```text
retired/
├── public/                # Static assets (favicon, images, etc.)
├── src/
│   ├── components/        # Elysia JSX components (Hero, RdapSection, etc.)
│   ├── views/             # Page view layouts
│   ├── index.ts           # Elysia entry point & routing
│   ├── rdap.ts            # RDAP fetcher, IANA bootstrap, & data normalization
│   └── template.ts        # SSR document renderer
├── test/
│   └── rdap.test.ts       # RDAP parsing & SSR tests
├── domains.txt            # (Coming Soon) Registered parked domains list
├── wrangler.jsonc         # Edge runtime configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.4.2+)

### Installation

```bash
git clone https://github.com/hydrate-id/retired.git
cd retired
bun install
```

### Local Development

Start the local development server:

```bash
bun run dev
```

Or run tests:

```bash
bun test
```

---

## API Reference

### `GET /api/rdap`

Query normalized RDAP data for any domain.

#### Query Parameters:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain`  | string | No | Domain to lookup (defaults to current `Host` header) |

#### Response Example:
```json
{
  "domain": "expy.my.id",
  "tld": "id",
  "rdapServer": "rdap.org",
  "handle": "17773188_DOMAIN_ID-ID",
  "status": ["client transfer prohibited"],
  "registrar": "PT JC Indonesia",
  "dnssec": "Unsigned",
  "dates": {
    "registration": "2025-11-21T09:48:32Z",
    "expiration": "2027-11-21T23:59:59Z",
    "lastChanged": "2026-03-22T09:20:50Z"
  },
  "nameservers": [
    "emma.ns.cloudflare.com",
    "harvey.ns.cloudflare.com"
  ],
  "entities": [...],
  "abuse": {
    "email": null,
    "phone": null
  },
  "found": true,
  "error": null
}
```

---

## License

MIT
