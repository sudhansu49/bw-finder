import type { LocaleCode, CurrencyCode, LanguageInfo, CurrencyInfo, TranslationKeys } from './types'
import { en } from './translations/en'
import { hi } from './translations/hi'
import { hiLatn } from './translations/hi-latn'
import { bn } from './translations/bn'
import { te } from './translations/te'
import { mr } from './translations/mr'
import { ta } from './translations/ta'
import { ur } from './translations/ur'
import { gu } from './translations/gu'
import { kn } from './translations/kn'
import { or } from './translations/or'
import { pa } from './translations/pa'
import { ml } from './translations/ml'
import { as } from './translations/as'

// ─── Language Registry ────────────────────────────────────────────────────────

export const languages: LanguageInfo[] = [
  { code: 'en', name: 'English', englishName: 'English', dir: 'ltr', script: 'Latin' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', dir: 'ltr', script: 'Devanagari' },
  { code: 'hi-latn', name: 'Hinglish', englishName: 'Roman Hindi', dir: 'ltr', script: 'Latin' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', dir: 'ltr', script: 'Bengali' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', dir: 'ltr', script: 'Telugu' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', dir: 'ltr', script: 'Devanagari' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', dir: 'ltr', script: 'Tamil' },
  { code: 'ur', name: 'اردو', englishName: 'Urdu', dir: 'rtl', script: 'Arabic' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', dir: 'ltr', script: 'Gujarati' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', dir: 'ltr', script: 'Kannada' },
  { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia', dir: 'ltr', script: 'Odia' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', dir: 'ltr', script: 'Gurmukhi' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', dir: 'ltr', script: 'Malayalam' },
  { code: 'as', name: 'অসমীয়া', englishName: 'Assamese', dir: 'ltr', script: 'Assamese' },
]

export const currencies: CurrencyInfo[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-EU' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
]

// ─── Translation Map ──────────────────────────────────────────────────────────

const translationMap: Record<LocaleCode, TranslationKeys> = {
  en,
  hi,
  'hi-latn': hiLatn,
  bn,
  te,
  mr,
  ta,
  ur,
  gu,
  kn,
  or,
  pa,
  ml,
  as,
}

// ─── Get Translations ─────────────────────────────────────────────────────────

export function getTranslations(locale: LocaleCode): TranslationKeys {
  return translationMap[locale] || translationMap.en
}

// ─── Get Language Info ────────────────────────────────────────────────────────

export function getLanguageInfo(code: LocaleCode): LanguageInfo {
  return languages.find(l => l.code === code) || languages[0]
}

// ─── Get Currency Info ────────────────────────────────────────────────────────

export function getCurrencyInfo(code: CurrencyCode): CurrencyInfo {
  return currencies.find(c => c.code === code) || currencies[0]
}

// ─── Format Currency ──────────────────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  locale?: string
): string {
  const info = getCurrencyInfo(currency)
  const formatterLocale = locale || info.locale

  try {
    return new Intl.NumberFormat(formatterLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Fallback for unsupported locale/currency combos
    return `${info.symbol}${amount.toLocaleString()}`
  }
}

// ─── Format Compact Currency (e.g., ₹1.5L, $1.2M) ───────────────────────────

export function formatCompactCurrency(
  amount: number,
  currency: CurrencyCode = 'INR'
): string {
  const info = getCurrencyInfo(currency)

  if (currency === 'INR') {
    // Indian number system: Lakhs & Crores
    if (amount >= 10000000) {
      return `${info.symbol}${(amount / 10000000).toFixed(1)}Cr`
    }
    if (amount >= 100000) {
      return `${info.symbol}${(amount / 100000).toFixed(1)}L`
    }
    if (amount >= 1000) {
      return `${info.symbol}${(amount / 1000).toFixed(1)}K`
    }
    return `${info.symbol}${amount.toLocaleString('en-IN')}`
  }

  // Western number system: K, M, B
  if (amount >= 1000000000) {
    return `${info.symbol}${(amount / 1000000000).toFixed(1)}B`
  }
  if (amount >= 1000000) {
    return `${info.symbol}${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${info.symbol}${(amount / 1000).toFixed(1)}K`
  }
  return `${info.symbol}${amount.toLocaleString()}`
}

// ─── Format Number ────────────────────────────────────────────────────────────

export function formatNumber(
  value: number,
  currency: CurrencyCode = 'INR'
): string {
  const info = getCurrencyInfo(currency)
  if (currency === 'INR') {
    // Indian number system grouping
    return value.toLocaleString('en-IN')
  }
  return value.toLocaleString(info.locale)
}

// ─── Format Percentage ────────────────────────────────────────────────────────

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// The hook will be created as a separate file that uses Zustand store
// This module provides pure functions only
