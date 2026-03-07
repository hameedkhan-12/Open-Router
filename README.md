# OpenRouter

A Turborepo-based monorepo for OpenRouter - an API dashboard with a full-stack application.

## What's Inside?

This Turborepo includes the following packages/apps:

### Apps
- **`apps/primary-backend`**: Express.js backend API server with authentication, rate limiting, and metrics
- **`apps/frontend-dashboard`**: React 19 frontend dashboard for managing API keys and viewing metrics

### Packages
- **`packages/db`**: Prisma database setup with PostgreSQL adapter
- **`packages/shared`**: Shared TypeScript types and utilities
- **`packages/ui`**: Reusable React component library (built with Radix UI)
- **`packages/eslint-config`**: Shared ESLint configurations
- **`packages/typescript-config`**: Shared TypeScript configurations

## Tech Stack

- **Runtime**: Bun 1.3.10
- **Package Manager**: Monorepo workspaces with Bun
- **Build System**: Turborepo
- **Frontend**: React 19, React Router, Recharts, Radix UI
- **Backend**: Express.js, PostgreSQL, Prisma
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites
- Bun >= 1.3.10
- Node >= 18
- PostgreSQL database

### Installation

Install dependencies:

```bash
bun install
```

### Development

Run all dev servers in watch mode:

```bash
bun run dev
```

This will start:
- Frontend dashboard on `http://localhost:3000`
- Backend API on `http://localhost:3001`

### Build

Build all packages:

```bash
bun run build
```

### Lint

Check code quality:

```bash
bun run lint
```

### Format

Format code with Prettier:

```bash
bun run format
```

## Project Structure

```
.
├── apps/
│   ├── primary-backend/          # Express backend
│   └── frontend-dashboard/       # React frontend
├── packages/
│   ├── db/                       # Prisma + Database
│   ├── shared/                   # Shared types
│   ├── ui/                       # Component library
│   ├── eslint-config/            # ESLint config
│   └── typescript-config/        # TypeScript config
├── docker-compose.yml            # Docker Compose setup
├── turbo.json                    # Turborepo config
└── bun.lock                      # Bun lockfile
```

## Environment Variables

Create `.env` files in the root and backend:

**Root `.env`:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/openrouter
```

**`apps/primary-backend/.env`:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/openrouter
JWT_SECRET=your_jwt_secret_here
PORT=3001
```

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
>>>>>>> 1616d33 (Dashboard Created)
