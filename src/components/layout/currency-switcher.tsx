'use client'

import { useAppStore } from '@/store/app-store'
import { currencies } from '@/lib/i18n/index'
import type { CurrencyCode } from '@/lib/i18n/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DollarSign, Check } from 'lucide-react'

export function CurrencySwitcher() {
  const currency = useAppStore((s) => s.currency)
  const setCurrency = useAppStore((s) => s.setCurrency)
  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1 px-2 text-muted-foreground hover:text-foreground"
        >
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-semibold">
            {currentCurrency.symbol} {currentCurrency.code}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Select Currency / मुद्रा चुनें
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr.code as CurrencyCode)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold w-6 text-center">{curr.symbol}</span>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{curr.code}</span>
                <span className="text-[11px] text-muted-foreground">{curr.name}</span>
              </div>
            </div>
            {currency === curr.code && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
