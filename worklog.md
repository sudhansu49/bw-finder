---
Task ID: 1
Agent: Main Agent
Task: Fix leads not being found in the BW Finder application

Work Log:
- Investigated the search/lead finding flow by testing APIs directly
- Discovered the search API was taking 72+ seconds due to sequential web searches with 3s delays between each
- Found that the search was returning 0 results for some queries (like Mumbai Salon) due to slow sequential execution
- Fixed the search API route (`/api/businesses/search/route.ts`):
  - Changed from sequential web searches to parallel web searches
  - Reduced number of search queries from 4 to 2 (focused queries)
  - Reduced retry delays and retry counts for speed
  - Added better console logging for debugging
  - Added scoring timeout (5s) to prevent indefinite waits
  - Improved database fallback with broader matching (category + country, then just category)
  - Extracted website status detection into shared helper functions
- Updated the frontend search view (`/components/search/search-view.tsx`):
  - Added search progress messages that rotate every 5 seconds
  - Added elapsed time counter displayed on the button and in the loading state
  - Added AbortController with 2-minute timeout
  - Added proper timeout error handling
  - Added `credentials: 'include'` to fetch calls for lead creation
- Fixed the leads API (`/api/leads/route.ts`):
  - Added automatic refresh token fallback when access token expires
  - This allows lead creation to work even when the 15-minute access token has expired
- Verified the complete end-to-end flow via Agent Browser:
  - Login → Navigate to Lead Finder → Select India + Salon → Search → 13 results found in ~30s
  - "Add All No-Website as Leads" button works correctly
  - Leads are saved to the database

Stage Summary:
- Search API now returns results in ~30 seconds (was 72+ seconds or 0 results)
- Frontend shows progress messages and elapsed time during search
- Lead creation works with expired access tokens via auto-refresh
- All lint checks pass
