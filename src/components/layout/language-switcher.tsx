'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { languages, getLanguageInfo } from '@/lib/i18n/index'
import type { LocaleCode } from '@/lib/i18n/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, Check } from 'lucide-react'

export function LanguageSwitcher() {
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)
  const currentLang = languages.find((l) => l.code === locale) || languages[0]

  // Sync document lang/dir when locale changes
  useEffect(() => {
    const info = getLanguageInfo(locale)
    document.documentElement.lang = locale === 'hi-latn' ? 'hi-Latn' : locale
    document.documentElement.dir = info.dir
  }, [locale])

  const handleSelect = (code: LocaleCode) => {
    setLocale(code)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-medium max-w-[80px] truncate">
            {currentLang.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Select Language / भाषा चुनें
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium text-sm">{lang.name}</span>
              <span className="text-[11px] text-muted-foreground">{lang.englishName} • {lang.script}</span>
            </div>
            {locale === lang.code && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
