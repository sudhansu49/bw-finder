# Task 4-c: Update Reports and Help Center pages to use real API data

## Summary
Updated 2 pages (Reports and Help Center) to use real API data instead of hardcoded demo data.

## Files Modified
1. `/src/app/api/user/reports/route.ts` - Restructured API response to match frontend expectations with kpi, leadTrend, outreachPerformance, revenueByCategory, leadScoreDistribution, recentLeads
2. `/src/components/reports/reports-view.tsx` - Replaced all demo data generators with API fetch, added loading skeletons, empty states, error handling
3. `/src/components/help/help-view.tsx` - Added ticket creation dialog, ticket list section, loading skeletons, form validation

## Key Changes
- Reports API now returns trend data (comparing current vs previous period), lead score distribution, recent leads with business info, and outreach performance per channel
- Reports View fetches from API on mount and when range changes, maps API data to existing chart structures
- Help View has a Dialog form for creating tickets (subject, description, priority, category) and displays existing tickets in a table
- Both pages have proper loading skeleton states and graceful error/empty states

## Status
- Lint: PASS
- TypeScript: PASS (no errors in modified files)
- Dev server: Running
