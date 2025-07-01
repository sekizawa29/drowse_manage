"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon, Download, Upload } from "lucide-react"
import { AddSaleDialog } from "@/components/sales/add-sale-dialog"

export function DashboardHeader({
  selectedMonth,
  onMonthChange,
}: {
  selectedMonth: Date
  onMonthChange: (date: Date) => void
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
        <p className="text-muted-foreground">CBD製品の売上データと分析情報を確認できます。</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className={cn("justify-start text-left font-normal")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" title="CSVインポート">
            <Upload className="h-4 w-4" />
            <span className="sr-only">CSVインポート</span>
          </Button>
          <Button variant="outline" size="icon" title="CSVエクスポート">
            <Download className="h-4 w-4" />
            <span className="sr-only">CSVエクスポート</span>
          </Button>
        </div>
        <AddSaleDialog />
      </div>
    </div>
  )
}
