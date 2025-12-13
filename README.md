# PulseLog

Training intelligence for competitive runners. PulseLog answers one question: "Am I training in a way that preserves freshness and performance?"

## Architecture

### Core Principles

1. **Deterministic Decision System**: All insights are derived from observable data and fixed rules. No AI hallucination.
2. **AI as Explanation Tool Only**: AI converts precomputed facts into clear explanations. It never decides training advice.
3. **Elite Performance Tool**: Designed for competitive athletes, not lifestyle apps.
4. **Mobile-First**: Optimized for quick daily logs (under 30 seconds).

### Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (custom color palette)
- **shadcn/ui** (customized components)
- **Supabase** (Postgres, Auth, Storage)
- **Stripe** (subscriptions)
- **OpenAI API** (weekly summaries only)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` (optional)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

3. Set up Supabase database:
   - Run the SQL in `database/schema.sql` in your Supabase SQL editor

4. Run the development server:
```bash
npm run dev
```

## Decision System

The deterministic decision system (`lib/decisionSystem.ts`) implements the following rules:

1. **Easy Pace Range Calculation**: Based on race times using VDOT principles
2. **Easy-Day Pacing Violations**: Detects when easy runs exceed pace range AND RPE ≥ 6
3. **Fatigue Accumulation**: Flags when RPE ≥ 7 for 3+ sessions within 5 days
4. **Sleep Debt**: Alerts when average sleep < 6.5h over 3 days
5. **Pre-Meet Sensitivity**: Stricter thresholds within 7 days of a meet
6. **Load Spike Detection**: Warns when week-over-week mileage increases > 20%

### Insight Priority Order

1. Pre-meet risk signals
2. Easy-day pacing violations
3. Fatigue accumulation
4. Sleep modifiers
5. Load spikes

## AI Usage

AI is strictly constrained to:
- Converting precomputed facts into clear, coach-like explanations
- Summarizing weekly trends already validated by rules

AI never:
- Invents advice
- Predicts injuries
- Escalates severity
- Overrides deterministic decisions

## Design System

### Colors

- **Primary**: Deep Athletic Navy (#0E1A2B)
- **Secondary**: Performance Green (#1DB954)
- **Warning**: Fatigue Yellow (#F5C451)
- **Risk**: Risk Red (#E5533D)
- **Neutrals**: Off-white background (#F7F9FC), Charcoal text (#2A2E35)

### Rules

- No purple, pink, or gradients
- High whitespace
- Sharp typography
- Subtle shadows only

## Deployment

Deploy to Vercel:

```bash
vercel
```

Ensure all environment variables are set in Vercel dashboard.

## License

Proprietary

