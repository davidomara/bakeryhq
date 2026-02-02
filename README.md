# BakeryHQ Costing App

A production-ready bakery costing and profit tracking app built on the Stack Auth multi-tenant starter template (Next.js App Router + TypeScript + Tailwind + shadcn/ui).

## Features

- Product costing with ingredient, packaging, labor, and overhead breakdowns
- Auto pricing recommendations (markup, target profit, target margin)
- Wedding cake costing with tiers, extras, and print-friendly quote view
- Monthly profit summary with sales log and rollups
- XLSX exports for product, wedding, and monthly summary

## Getting Started

## User Manual

See `user-manual.md` for the full quickstart and feature reference.

1. Clone the repository

    ```bash
    git clone git@github.com:stack-auth/stack-template.git
    ```

2. Install dependencies

    ```bash
    npm install
    ```

3. Create environment files

    ```bash
    cp .env.example .env.local
    ```

    Fill in Stack Auth keys in `.env.local` and set the database connection string:

    ```env
    DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/bakeryhq?schema=public
    ```

4. Register an account on [Stack Auth](https://stack-auth.com), copy the keys from the dashboard, and paste them into the `.env.local` file. Then, enable "client team creation" on the team settings tab.

    If you want to learn more about Stack Auth or self-host it, check out the [Docs](https://docs.stack-auth.com) and [GitHub](https://github.com/stack-auth/stack).

5. Run Prisma migrations and seed data

    ```bash
    npm run prisma:generate
    npm run prisma:migrate
    npm run prisma:seed
    ```

6. Start the development server and go to [http://localhost:3000](http://localhost:3000)

    ```bash
    npm run dev 
    ```

## Prisma Studio

```bash
npx prisma studio
```

## Tests

```bash
npm run test
```

## Pricing Terms

- Markup (bps): percentage markup on total cost. 100 bps = 1%.
- Target profit (UGX): absolute profit added to total cost.
- Target margin (bps): desired margin on selling price (100 bps = 1%).
- Pricing mode: which pricing input you intend to use.
- Auto recommended: highest valid price from the inputs above.

## Useful Commands

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npx prisma db push
npx prisma studio
npm run test
npm run dev
```

## Features & Tech Stack

- Next.js app router
- TypeScript
- Tailwind & Shadcn UI
- Stack Auth
- Multi-tenancy (teams/orgs) with Stack Auth
- Prisma + Postgres
- Zod validation
- Dark mode

## Inspired by

- [Shadcn UI](https://github.com/shadcn-ui/ui)
- [Shadcn Taxonomy](https://github.com/shadcn-ui/taxonomy)
