'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { getLanguageInfo } from '@/lib/i18n/index'

/**
 * Syncs the Zustand store locale/currency state with the document's
 * lang and dir attributes. Runs on mount and whenever locale changes.
 */
export function LocaleSync() {
  const locale = useAppStore((s) => s.locale)

  useEffect(() => {
    const info = getLanguageInfo(locale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'hi-latn' ? 'hi-Latn' : locale
      document.documentElement.dir = info.dir
    }
  }, [locale])

  return null
}
