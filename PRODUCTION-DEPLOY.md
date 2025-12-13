# PulseLog Production Deployment Guide

## 1. Vercel Deployment Readiness ✅

**Status**: Ready for deployment

- Next.js 14 App Router configured
- TypeScript compilation passes
- All dependencies in package.json
- Middleware configured for auth routing
- Build script: `npm run build`

**Verification**: Run `npm run build` locally - should complete without errors.

---

## 2. Required Environment Variables (Vercel)

Set in **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anon/public key |
| `STRIPE_SECRET_KEY` | ✅ Yes | Stripe secret key (production: `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ Yes | Webhook signing secret (from Stripe Dashboard) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | Stripe publishable key (production: `pk_live_...`) |
| `OPENAI_API_KEY` | ⚠️ Optional | Required only for weekly AI summaries |

**Note**: Use **production** keys for all Stripe variables. `STRIPE_WEBHOOK_SECRET` is obtained after creating the webhook endpoint.

---

## 3. Stripe Webhook Configuration

### Endpoint URL
```
https://your-domain.vercel.app/api/stripe/webhook
```

### Required Events (Subscribe in Stripe Dashboard)
1. `customer.subscription.created`
2. `customer.subscription.updated`
3. `customer.subscription.deleted`
4. `invoice.payment_succeeded`
5. `invoice.payment_failed`

### Setup Steps
1. Stripe Dashboard → Developers → Webhooks → "Add endpoint"
2. URL: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select the 5 events above
4. Copy "Signing secret" (`whsec_...`)
5. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

---

## 4. Stripe Webhook Route Review

**File**: `app/api/stripe/webhook/route.ts`

### ✅ Implementation Status
- [x] Signature verification with `STRIPE_WEBHOOK_SECRET`
- [x] Handles all 5 required events
- [x] Updates Supabase `subscriptions` table correctly
- [x] Error handling and logging
- [x] Returns proper HTTP status codes

### ⚠️ Known Limitation
The webhook handler requires `stripe_customer_id` to exist in the `subscriptions` table to find `user_id`. This means:
- The checkout/session creation code (not yet implemented) must create the initial subscription record with `stripe_customer_id` before the webhook fires.
- This is expected behavior - the webhook updates existing records, it does not create them.

---

## 5. End-to-End Production Test Checklist

### Authentication & Onboarding
- [ ] Sign up creates user in Supabase
- [ ] Onboarding creates `athlete_profile`
- [ ] Login redirects to dashboard
- [ ] Logout clears session
- [ ] Unauthenticated users redirected to `/login`

### Daily Logging
- [ ] Submit daily log (< 30 seconds)
- [ ] Log saves to `daily_logs` table
- [ ] Duplicate log for same date prevented
- [ ] Redirects to dashboard after submission

### Insights Generation
- [ ] Dashboard shows readiness indicator (green/yellow/red)
- [ ] Priority insight displays when conditions met
- [ ] "Why am I seeing this?" expands raw data
- [ ] Insights page groups by severity

### Decision System Rules (Test Each)
- [ ] **Easy Pace Violation**: Easy run too fast + RPE ≥ 6 → insight
- [ ] **Fatigue**: 3+ sessions RPE ≥ 7 in 5 days → insight
- [ ] **Sleep Debt**: 3+ days sleep < 6.5h → insight
- [ ] **Load Spike**: Week-over-week mileage +20% → insight
- [ ] **Pre-Meet Risk**: Meet within 7 days + high-intensity → insight

### Mobile Experience
- [ ] All pages render on mobile
- [ ] Navigation bar accessible
- [ ] Forms mobile-friendly
- [ ] Sliders work on touch

### Performance & Security
- [ ] Dashboard loads < 2 seconds
- [ ] No console errors
- [ ] RLS policies prevent data leakage
- [ ] Webhook signature verification works

### Stripe Integration (If Implemented)
- [ ] Settings page shows subscription status
- [ ] Webhook receives events
- [ ] Database updates on subscription changes

---

## 6. Supabase Setup (Pre-Deployment)

### Database
- [ ] Run `database/schema.sql` in Supabase SQL Editor
- [ ] Enable RLS on all tables
- [ ] Create RLS policies (see `SETUP.md`)

### RLS Policies Required
```sql
-- Enable RLS
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meets ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies (see SETUP.md for full SQL)
```

---

## 7. Deployment Steps

1. **Push to GitHub** (if using Git integration)
2. **Import to Vercel**: Connect GitHub repo or deploy via CLI
3. **Set Environment Variables**: Add all 6 variables from section 2
4. **Deploy**: Vercel auto-deploys on push to main
5. **Configure Stripe Webhook**: Use production URL from step 3
6. **Test**: Run through checklist in section 5

---

## 8. Post-Deployment

### Immediate Checks
- Visit production URL
- Check Vercel deployment logs
- Test signup flow
- Verify Supabase RLS policies

### Monitoring
- Vercel Analytics (optional)
- Stripe webhook delivery status
- Supabase error logs
- OpenAI API usage (if enabled)

---

## Missing Components (Not Blocking)

1. **Stripe Checkout Session Creation**: `handleSubscribe` in `app/settings/settings-client.tsx` shows placeholder. Full checkout flow not implemented.
2. **Initial Subscription Record Creation**: Webhook expects existing record with `stripe_customer_id`. Checkout flow must create this first.

These do not block deployment but must be implemented before subscriptions work end-to-end.

