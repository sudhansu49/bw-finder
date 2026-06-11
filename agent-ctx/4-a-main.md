# Task 4-a: Update Profile and Billing Pages to Use Real API Data

## Agent: main

## Summary
Updated both Profile and Billing pages to replace hardcoded demo data with real API calls.

## Changes Made

### ProfileView (`src/components/profile/profile-view.tsx`)
- Added `useEffect` to fetch profile from `GET /api/user/profile?userId=USER_ID` on mount
- Pre-fills form fields from API response (name, email, company)
- Replaced `setTimeout` in `handleSavePersonal` with real `PUT /api/user/profile` API call
- Replaced `setTimeout` in `handleChangePassword` with real `POST /api/user/password` API call
- Updates Zustand store on save: `setUser({...user, name, email, company})`
- Added loading skeleton while fetching profile data
- Shows real join date, credits, role, plan from API response
- Error handling: displays API error messages in toast (e.g., "Email is already in use", "Current password is incorrect")
- Preserved all existing UI/UX, dark mode, framer-motion animations

### BillingView (`src/components/billing/billing-view.tsx`)
- Added `useEffect` to fetch billing data from `GET /api/user/billing?userId=USER_ID` on mount
- Replaced hardcoded `billingHistory` with real `creditTransactions` from API
- Shows real current balance, subscription info, usage data from API
- Transaction table shows: date, description, amount (+/- colored), balance, type badge
- Added loading skeleton while fetching billing data
- Added empty state when no transactions exist
- Payment method uses API data (brand, last4, expiry)
- Usage warning shows only when credits < 500
- Preserved all existing UI/UX, dark mode, framer-motion animations

## Verification
- Lint passes clean with no errors
- Dev server log shows no errors
