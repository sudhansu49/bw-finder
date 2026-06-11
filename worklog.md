---
Task ID: 1
Agent: main
Task: Fix sidebar truncation, layout issues, dark mode, and responsive design

Work Log:
- Analyzed uploaded screenshot showing sidebar truncation issue
- Fixed UserSidebar: Added overflow-hidden and min-h-0 to ScrollArea, compacted bottom section
- Fixed AdminSidebar: Same fixes - overflow-hidden, min-h-0, compacted layout
- Fixed both layouts: Changed from min-h-screen to h-screen overflow-hidden for proper viewport containment
- Fixed footer: Moved inside scrollable main area with mt-auto for proper sticky behavior
- Added dark mode support to AdminLayout (previously hardcoded white backgrounds)
- Added Sun/Moon icon toggle for both UserLayout and AdminLayout headers
- Fixed mobile sidebar: Proper overlay, X button, responsive hamburger menu
- Tested sidebar collapse/expand: Works correctly with icon-only mode
- Tested Admin↔User panel switching: Works via dropdown menu
- Tested dark mode: Works correctly in both panels
- Tested mobile responsive: Sidebar hidden on mobile, hamburger menu opens overlay
- Verified no browser console errors
- Verified lint passes clean

Stage Summary:
- All sidebar items now visible with proper scrolling
- Layout properly constrained to viewport height (h-screen instead of min-h-screen)
- Footer visible at bottom of scroll area
- Dark mode works in both Admin and User panels
- Mobile responsive design works correctly
- Admin and User panels are visually distinct (red vs amber theming)
