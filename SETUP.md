# PulseLog Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_key (optional)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   STRIPE_SECRET_KEY=your_stripe_secret
   ```

3. **Database Setup**
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Run the SQL from `database/schema.sql`
   - This creates all required tables

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access the App**
   - Open http://localhost:3000
   - Sign up for a new account
   - Complete onboarding
   - Start logging!

## Supabase Configuration

### Row Level Security (RLS)

You'll need to set up RLS policies. Here are the recommended policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meets ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON athlete_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON athlete_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON athlete_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Similar policies for daily_logs, meets, insights, subscriptions
CREATE POLICY "Users can manage own logs" ON daily_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meets" ON meets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insights" ON insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);
```

## Stripe Setup

1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Set up webhooks for subscription events (optional for MVP)
4. Configure products in Stripe:
   - Monthly plan: $15/month
   - Annual plan: $150/year

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

The app will automatically deploy on every push to main.

## Testing the Decision System

After logging a few sessions, you should see insights appear:

1. **Easy Pace Violation**: Log an easy run with pace faster than your calculated range and RPE ≥ 6
2. **Fatigue Accumulation**: Log 3+ sessions with RPE ≥ 7 within 5 days
3. **Sleep Debt**: Log 3+ days with sleep < 6.5 hours
4. **Load Spike**: Increase weekly mileage by > 20%
5. **Pre-Meet Risk**: Add a meet within 7 days and log high-intensity training

## Troubleshooting

### "Unauthorized" errors
- Check that RLS policies are set up correctly
- Verify environment variables are set
- Check Supabase project is active

### Insights not appearing
- Ensure you have at least 2-3 logs
- Check that athlete profile has race times set
- Verify date formats are correct

### AI summaries not working
- Check OPENAI_API_KEY is set
- Verify API key has credits
- Check browser console for errors

