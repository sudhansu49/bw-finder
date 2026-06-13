---
Task ID: 14
Agent: Main Agent
Task: Phase 14 - SaaS Billing with Stripe Integration

Work Log:
- Explored full project structure: 18 user views, 23 admin views, 33 API routes, Zustand store, i18n
- Installed Stripe SDK (stripe@22.2.1)
- Updated Prisma schema with new billing fields:
  - Plan: added yearlyPrice, tier, interval, stripePriceId, stripeProductId
  - Subscription: added interval, stripeSubscriptionId, stripeCustomerId
  - User: added stripeSubscriptionId
- Created Stripe utility library (src/lib/stripe/index.ts):
  - Plan configs for Starter (₹1,499/mo), Agency (₹4,999/mo), Enterprise (₹14,999/mo)
  - Demo mode simulation for sandbox (no real Stripe keys needed)
  - Live Stripe mode ready for production
  - Price formatting for multi-currency support
- Created 5 Stripe API routes:
  - POST /api/stripe/checkout - Create checkout session (demo + live)
  - POST /api/stripe/portal - Customer portal session
  - POST /api/stripe/webhook - Handle Stripe webhooks (8 event types)
  - GET /api/stripe/plans - Get all plans with monthly/yearly pricing
  - POST /api/stripe/cancel - Cancel subscription
  - POST /api/stripe/subscribe - Change plan (upgrade/downgrade)
- Rebuilt Subscription View with:
  - 3 plan cards: Starter, Agency, Enterprise
  - Monthly/Yearly toggle with "Save 17%" badge
  - Current plan indicator with active subscription banner
  - Cancel subscription dialog (immediate or at period end)
  - Plan switching with checkout flow
  - FAQ section
  - "Contact Sales" CTA for custom enterprise
- Rebuilt Billing View with:
  - Summary cards: Current Plan, Credits Balance, This Month Spent, Days Until Renewal
  - Subscription details card with status, plan, amount, period
  - Payment method card (dark gradient card design)
  - Credit usage progress bar
  - Billing history table with transactions
  - Stripe customer portal integration
- Updated seed route with new plan structure (7 plans: 3 tiers × 2 intervals + Free)
- Updated login API to return planTier
- Updated AppUser type in store with planTier
- Updated user sidebar plan badge to use tier-based naming
- Updated admin subscriptions view for new tier names
- Updated billing/subscription API routes to return tier + interval fields
- Verified all pages with Agent Browser:
  - Subscription page: 3 plans visible, toggle works, prices update correctly
  - Billing page: All cards, tables, and payment info displays correctly
  - Plan switching: Works in demo mode, credits added, subscription updated
  - Yearly toggle: Shows monthly equivalent (₹1,249, ₹4,166, ₹12,499) with savings

Stage Summary:
- Full SaaS billing system implemented with Stripe integration
- Demo mode works without real Stripe keys
- Production-ready: add STRIPE_SECRET_KEY env var and all Stripe features activate
- 3 tiers: Starter (₹1,499), Agency (₹4,999), Enterprise (₹14,999)
- Monthly + Yearly billing with 17% annual discount
- Plan switching, cancellation, and management working
- All API routes tested and verified
- Lint passes clean, no errors
