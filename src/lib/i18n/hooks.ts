'use client'

import { useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import type { LocaleCode, CurrencyCode, TranslationKeys } from '@/lib/i18n/types'
import { getTranslations, getLanguageInfo, formatCurrency, formatCompactCurrency, formatNumber, formatPercentage, getCurrencyInfo } from '@/lib/i18n/index'

// ─── useTranslation Hook ─────────────────────────────────────────────────────

/**
 * Access translations based on current locale.
 * Returns the full translation object + a `t` helper for dot-notation access.
 */
export function useTranslation() {
  const locale = useAppStore((s) => s.locale)

  const translations = getTranslations(locale)

  // Dot-notation helper: t('nav.dashboard') => translations.nav.dashboard
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split('.')
      let result: any = translations
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k]
        } else {
          return fallback || key
        }
      }
      return typeof result === 'string' ? result : fallback || key
    },
    [translations]
  )

  return {
    locale,
    translations,
    t,
    isRTL: getLanguageInfo(locale).dir === 'rtl',
    languageInfo: getLanguageInfo(locale),
  }
}

// ─── useCurrency Hook ─────────────────────────────────────────────────────────

/**
 * Access currency formatting based on current currency setting.
 */
export function useCurrency() {
  const currency = useAppStore((s) => s.currency)

  return {
    currency,
    currencyInfo: getCurrencyInfo(currency),
    format: useCallback(
      (amount: number) => formatCurrency(amount, currency),
      [currency]
    ),
    formatCompact: useCallback(
      (amount: number) => formatCompactCurrency(amount, currency),
      [currency]
    ),
    formatNumber: useCallback(
      (value: number) => formatNumber(value, currency),
      [currency]
    ),
    formatPercentage,
    symbol: getCurrencyInfo(currency).symbol,
  }
}

// ─── Non-hook utilities (for use outside React components) ────────────────────

export function getCurrentTranslations(locale?: LocaleCode): TranslationKeys {
  const loc = locale || useAppStore.getState().locale
  return getTranslations(loc)
}

export function getCurrentCurrency(): CurrencyCode {
  return useAppStore.getState().currency
}

export { formatCurrency, formatCompactCurrency, formatNumber, formatPercentage, getLanguageInfo, getCurrencyInfo }
