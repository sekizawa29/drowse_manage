"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { ja } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  mode?: "default" | "single" | "multiple" | "range" | "month"
}

function Calendar({ className, classNames, showOutsideDays = true, mode = "default", ...props }: CalendarProps) {
  // ステートの初期値を適切に設定
  const initialDate = props.selected instanceof Date ? props.selected : new Date()
  const [year, setYear] = React.useState<number>(initialDate.getFullYear())
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  // 月選択モードの場合
  if (mode === "month") {
    return (
      <div className={cn("p-3", className)}>
        <div className="flex items-center justify-between">
          <button onClick={() => setYear(year - 1)} className={buttonVariants({ variant: "outline", size: "icon" })}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <Select value={year.toString()} onValueChange={(value) => setYear(Number.parseInt(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder={year.toString()} />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button onClick={() => setYear(year + 1)} className={buttonVariants({ variant: "outline", size: "icon" })}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {Array.from({ length: 12 }, (_, i) => {
            const date = new Date(year, i, 1)
            const isSelected =
              props.selected instanceof Date && props.selected.getMonth() === i && props.selected.getFullYear() === year

            return (
              <button
                key={i}
                onClick={() => {
                  if (props.onSelect) {
                    props.onSelect(date)
                  }
                }}
                className={cn(
                  "flex h-10 w-full items-center justify-center rounded-md p-2 text-sm",
                  isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {date.toLocaleString(ja, { month: "long" })}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // 通常のカレンダー表示（日付選択モード）
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between w-full",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      locale={ja}
      weekStartsOn={0} // 日曜日から始まるように設定
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
