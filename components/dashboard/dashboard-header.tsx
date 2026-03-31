"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { AddSaleDialog } from "@/components/sales/add-sale-dialog"

export function DashboardHeader({
  selectedMonth,
  onMonthChange,
}: {
  selectedMonth: Date
  onMonthChange: (date: Date) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="hidden md:block">
        <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
        <p className="text-muted-foreground">CBD製品の売上データと分析情報を確認できます。</p>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal")}>
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {format(selectedMonth, "yyyy年M月", { locale: ja })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="month"
              selected={selectedMonth}
              onSelect={(date) => date && onMonthChange(date)}
              initialFocus
              locale={ja}
            />
          </PopoverContent>
        </Popover>
        <AddSaleDialog />
      </div>
    </div>
  )
}
