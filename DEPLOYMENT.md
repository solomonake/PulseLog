# PulseLog Production Deployment Checklist

## 1. Vercel Deployment Readiness

### ✅ App Configuration
- [x] `next.config.js` configured
- [x] `package.json` has all dependencies
- [x] TypeScript configuration present
- [x] Tailwind CSS configured
- [x] Middleware for auth routing configured

### Build Verification
Run locally to verify:
```bash
npm install
npm run build
```

Expected: Build completes without errors.

---

## 2. Required Environment Variables (Vercel)

Set these in Vercel Dashboard → Project Settings → Environment Variables:

### Required (Production)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Optional
```
OPENAI_API_KEY=sk-... (for weekly summaries)
```

### Notes
- Use **production** Stripe keys (`sk_live_`, `pk_live_`)
- Use **production** Supabase project
- `STRIPE_WEBHOOK_SECRET` is obtained after creating webhook endpoint in Stripe

---

## 3. Stripe Webhook Configuration

### Webhook Endpoint URL
```
https://your-domain.vercel.app/api/stripe/webhook
```

### Required Events
Subscribe to these events in Stripe Dashboard:

1. `customer.subscription.created`
2. `customer.subscription.updated`
3. `customer.subscription.deleted`
4. `invoice.payment_succeeded`
5. `invoice.payment_failed`

### Setup Steps
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter production URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select the 5 events listed above
5. Copy the "Signing secret" (starts with `whsec_`)
6. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

### Testing
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Test webhook in Stripe Dashboard → Webhooks → Send test webhook

---

## 4. Stripe Webhook Route Review

**File**: `app/api/stripe/webhook/route.ts`

### ✅ Implementation Status
- [x] Signature verification using `STRIPE_WEBHOOK_SECRET`
- [x] Handles `customer.subscription.created`
- [x] Handles `customer.subscription.updated`
- [x] Handles `customer.subscription.deleted`
- [x] Handles `invoice.payment_succeeded`
- [x] Handles `invoice.payment_failed`
- [x] Updates Supabase `subscriptions` table
- [x] Error handling and logging

### ⚠️ Known Limitation
The webhook handler requires `stripe_customer_id` to exist in the `subscriptions` table to find the `user_id`. This means:
- Subscription creation must set `stripe_customer_id` in the database first
- The checkout/session creation code (not yet implemented) must insert initial subscription record

---

## 5. Supabase Configuration

### Database Setup
- [ ] Run `database/schema.sql` in Supabase SQL Editor
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Create RLS policies (see `SETUP.md`)

### Required RLS Policies
```sql
-- athlete_profiles
CREATE POLICY "Users can view own profile" ON athlete_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON athlete_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON athlete_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- daily_logs
CREATE POLICY "Users can manage own logs" ON daily_logs
  FOR ALL USING (auth.uid() = user_id);

-- meets
CREATE POLICY "Users can manage own meets" ON meets
  FOR ALL USING (auth.uid() = user_id);

-- insights
CREATE POLICY "Users can view own insights" ON insights
  FOR SELECT USING (auth.uid() = user_id);

-- subscriptions
CREATE POLICY "Users can manage own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);
```

---

## 6. End-to-End Production Test Checklist

### Authentication Flow
- [ ] Sign up creates user in Supabase
- [ ] Onboarding creates athlete_profile
- [ ] Login redirects to dashboard
- [ ] Logout clears session

### Daily Logging
- [ ] Can submit daily log (< 30 seconds)
- [ ] Log saves to `daily_logs` table
- [ ] Duplicate log for same date is prevented
- [ ] Redirects to dashboard after submission

### Insights Generation
- [ ] Dashboard shows readiness indicator (green/yellow/red)
- [ ] Priority insight displays when conditions met
- [ ] "Why am I seeing this?" expands raw data
- [ ] Insights page groups by severity
- [ ] Insights generate from decision system rules

### Decision System Rules (Test Each)
- [ ] **Easy Pace Violation**: Log easy run with pace too fast + RPE ≥ 6 → yellow/red insight
- [ ] **Fatigue Accumulation**: 3+ sessions with RPE ≥ 7 in 5 days → yellow/red insight
- [ ] **Sleep Debt**: 3+ days with sleep < 6.5h → yellow/red insight
- [ ] **Load Spike**: Week-over-week mileage increase > 20% → yellow/red insight
- [ ] **Pre-Meet Risk**: Meet within 7 days + high-intensity training → yellow insight

### Subscription Flow (If Implemented)
- [ ] Settings page shows subscription status
- [ ] Stripe checkout redirects correctly
- [ ] Webhook receives events and updates database
- [ ] Subscription status reflects in UI

### Mobile Experience
- [ ] All pages render correctly on mobile
- [ ] Navigation bar accessible
- [ ] Forms are mobile-friendly
- [ ] Sliders work on touch devices

### Performance
- [ ] Dashboard loads < 2 seconds
- [ ] Log submission < 1 second
- [ ] No console errors
- [ ] No 404s or 500s in production logs

### Security
- [ ] RLS policies prevent data leakage
- [ ] Auth middleware redirects unauthenticated users
- [ ] API routes validate authentication
- [ ] Webhook signature verification works

---

## 7. Post-Deployment Verification

### Immediate Checks
1. Visit production URL
2. Check Vercel deployment logs for errors
3. Verify environment variables are set
4. Test signup flow
5. Check Supabase logs for RLS violations

### Monitoring
- Set up Vercel Analytics (optional)
- Monitor Stripe webhook delivery in Stripe Dashboard
- Check Supabase logs for errors
- Monitor OpenAI API usage (if enabled)

### Rollback Plan
- Vercel automatically keeps previous deployments
- Can rollback via Vercel Dashboard → Deployments → "..." → Promote to Production

---

## 8. Missing Components (Not Blocking MVP)

These are noted but not required for initial deployment:

1. **Stripe Checkout Integration**: The `handleSubscribe` function in `app/settings/settings-client.tsx` currently shows an alert. Full Stripe Checkout session creation is not implemented.

2. **Subscription Creation Flow**: The webhook handler expects `stripe_customer_id` to exist. The checkout flow must create the initial subscription record with the customer ID.

---

## Quick Deploy Command

```bash
# If using Vercel CLI
vercel --prod

# Or push to main branch (if connected to GitHub)
git push origin main
```

