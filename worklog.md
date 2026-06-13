---
Task ID: 1
Agent: Main Agent
Task: Phase 2 - Multi-Language & Multi-Currency Implementation

Work Log:
- Created i18n infrastructure: types.ts, index.ts, hooks.ts in /src/lib/i18n/
- Created translation dictionaries for 14 Indian languages + English + Roman Hindi (16 files total)
- Languages: English, Hindi (Devanagari), Hinglish (Roman Hindi), Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Odia, Punjabi, Malayalam, Assamese
- Updated Zustand store with `locale` (LocaleCode) and `currency` (CurrencyCode) state, both persisted
- Built LanguageSwitcher component (dropdown with native name + English name + script info)
- Built CurrencySwitcher component (dropdown with symbol + code + name)
- Integrated switchers into User Panel header and Admin Panel header
- Updated User Sidebar and Admin Sidebar to use translation keys (labelKey/titleKey pattern)
- Updated breadcrumbs, footers, and dropdown menus with translated text
- Updated Profile view with real language/currency selectors (saves to Zustand, persisted to localStorage)
- Updated Dashboard view with useCurrency hook (₹1,50,000 format for INR, $1,500 for USD)
- Updated Billing view with useCurrency hook
- Updated Proposal view with useCurrency hook
- Updated Proposal PDF API route from USD to INR
- Created LocaleSync component for document lang/dir attribute sync
- Added LocaleSync to layout.tsx
- Fixed missing `subscriptions` key in all translation files
- Verified with Agent Browser: Language switching works (English→Hindi→Telugu→Hinglish), Currency switching works (INR↔USD↔EUR↔GBP), Profile language/currency selectors work, Dashboard shows ₹ formatted values

Stage Summary:
- Full i18n system with 14 Indian languages + English + Roman Hindi
- 4 currencies supported: INR (default), USD, EUR, GBP
- Language/currency preferences persist in localStorage via Zustand
- RTL support ready (Urdu)
- Indian number system formatting (Lakhs/Crores) for INR currency
- All navigation, breadcrumbs, footers, and key labels are translated
- Dashboard, Billing, and Proposal views use dynamic currency formatting
