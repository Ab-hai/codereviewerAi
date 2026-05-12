# CodeReviewer AI

An AI-powered GitHub Pull Request reviewer that automatically analyzes PR diffs and posts structured feedback as GitHub comments — powered by Groq's Llama 3.3 70B.

---

## How It Works

1. **Install** the GitHub App on any repository
2. **Open a PR** — GitHub fires a webhook to your server
3. **Webhook handler** instantly queues a review job (responds 200 immediately)
4. **Worker** fetches the PR diff via GitHub App auth, parses files, and sends to Groq AI
5. **AI analysis** returns structured issues (Critical / Warning / Suggestion) per file
6. **Comment posted** automatically on the PR with severity-tagged feedback
7. **Dashboard** lets you browse all reviews, issues by file, and connected repos

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.5 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Shadcn/UI |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Auth | NextAuth v5 (GitHub OAuth) |
| Queue | BullMQ |
| Cache / Queue broker | Redis (Redis Cloud or local) |
| AI | Groq SDK — `llama-3.3-70b-versatile` |
| GitHub integration | `@octokit/auth-app` (GitHub App) |
| Fonts | Geist Sans, Geist Mono, Instrument Serif |

---

## Folder Structure

```
codereviewerai/
├── prisma/
│   ├── schema.prisma          # DB schema (User, Repo, Review, ReviewIssue)
│   └── prisma.config.ts       # Prisma 7 config (dotenv + datasource URL)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       └── github/
│   │   │           └── route.ts   # GitHub webhook handler (HMAC verified)
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Reviews list with filters
│   │   │   ├── repos/
│   │   │   │   └── page.tsx       # Connected repos list
│   │   │   ├── reviews/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Review detail with issues by file
│   │   │   └── layout.tsx         # Dashboard layout with nav
│   │   ├── login/
│   │   │   └── page.tsx           # GitHub OAuth login page
│   │   ├── globals.css            # Tailwind v4, design tokens, animations
│   │   ├── layout.tsx             # Root layout (fonts, metadata)
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   ├── dashboard-nav.tsx      # Sticky top nav with avatar + logout
│   │   └── manual-trigger.tsx     # Dialog to manually trigger a review
│   ├── generated/
│   │   └── prisma/                # Prisma 7 generated client (custom output)
│   ├── lib/
│   │   ├── ai-review.ts           # Groq AI prompt + response parsing
│   │   ├── auth.ts                # NextAuth v5 config
│   │   ├── diff-parser.ts         # Unified diff → file chunks
│   │   ├── github.ts              # GitHub App Octokit helpers
│   │   ├── prisma.ts              # PrismaClient singleton
│   │   ├── queue.ts               # BullMQ queue definition
│   │   ├── redis.ts               # IORedis connection
│   │   └── utils.ts               # formatDistanceToNow, cn helpers
│   └── workers/
│       └── review-worker.ts       # BullMQ worker (full review pipeline)
├── .env.example                   # All required env vars with comments
├── package.json
└── tsconfig.json
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in every value.

| Variable | How to get it |
|---|---|
| `DATABASE_URL` | Neon → create project → copy connection string (pooled) |
| `AUTH_SECRET` | Run `npx auth secret` in terminal |
| `AUTH_GITHUB_ID` | GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App → Client ID |
| `AUTH_GITHUB_SECRET` | Same OAuth App → Generate a new client secret |
| `GITHUB_APP_ID` | GitHub → Settings → Developer Settings → GitHub Apps → your app → App ID |
| `GITHUB_APP_PRIVATE_KEY` | Same app → Generate a private key → open the `.pem` file → paste entire contents (including `-----BEGIN...-----`) |
| `GITHUB_WEBHOOK_SECRET` | Any random string you set when creating the GitHub App |
| `GITHUB_APP_NAME` | The slug of your GitHub App (from the URL: `github.com/apps/<slug>`) |
| `REDIS_URL` | Redis Cloud → create free DB → copy `redis://` connection string |
| `GROQ_API_KEY` | console.groq.com → API Keys → Create API Key |

> **GitHub App settings:** Set webhook URL to `https://<your-ngrok-url>/api/webhooks/github`. Subscribe to events: `Pull requests`, `Installations`.

---

## Getting Started (Local Dev)

### Prerequisites

- Node.js 20+
- A running PostgreSQL database (Neon free tier works)
- A running Redis instance (Redis Cloud free tier works)
- [ngrok](https://ngrok.com/) for exposing localhost to GitHub webhooks

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
# Fill in all values — see the table above
```

### 3. Push the database schema

```bash
npm run db:push
```

### 4. Start the three processes (three terminals)

**Terminal 1 — Next.js dev server**
```bash
npm run dev
```

**Terminal 2 — BullMQ worker**
```bash
npm run worker
```

**Terminal 3 — ngrok tunnel** (so GitHub can reach your local server)
```bash
ngrok http 3000
```

Copy the `https://xxxx.ngrok-free.app` URL and set it as your GitHub App webhook URL:
`https://xxxx.ngrok-free.app/api/webhooks/github`

### 5. Install the GitHub App on a repo

Go to `https://github.com/apps/<GITHUB_APP_NAME>/installations/new`, choose a repo, and open a pull request. The worker will pick it up, analyze the diff, and post a comment automatically.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run worker` | Start BullMQ review worker |
| `npm run db:migrate` | Create and apply a new Prisma migration |
| `npm run db:push` | Push schema to DB without a migration file (dev) |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run lint` | Run ESLint |

---

## AI Review Format

Each PR diff is analyzed by Llama 3.3 70B via Groq. The model returns structured issues:

```json
{
  "issues": [
    {
      "file": "src/lib/auth.ts",
      "line": 42,
      "severity": "CRITICAL",
      "message": "JWT secret is hardcoded — use an environment variable.",
      "suggestion": "Replace with process.env.AUTH_SECRET and ensure it is set in production."
    }
  ]
}
```

**Severity levels:**
- 🔴 `CRITICAL` — Security vulnerabilities, data loss risks, broken logic
- 🟡 `WARNING` — Performance issues, bad practices, potential bugs
- 🟢 `SUGGESTION` — Code style, readability, minor improvements

Files ignored during analysis: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `dist/`, `build/`, `.next/`, `generated/`, `migrations/`, `.d.ts` files, binary files.

---

## Deployment

### Deploy Next.js (Vercel)

Push to GitHub and import the repo on [vercel.com](https://vercel.com). Add all env vars under **Settings → Environment Variables**.

Set the webhook URL in your GitHub App to your Vercel production URL:
`https://your-app.vercel.app/api/webhooks/github`

> ⚠️ The BullMQ worker **cannot run on Vercel** (serverless — no persistent process). Deploy it separately.

### Deploy Worker

Options for hosting the worker as a long-running process:

- **Railway** — Add as a new service, set start command to `npm run worker`
- **Render** — Create a Background Worker service
- **Fly.io** — Docker + `CMD ["npm", "run", "worker"]`
- **VPS (Ubuntu/Debian)** — PM2: `pm2 start "npm run worker" --name review-worker`

The worker needs access to the same `DATABASE_URL`, `REDIS_URL`, and all GitHub + Groq env vars.

---

## License

MIT
