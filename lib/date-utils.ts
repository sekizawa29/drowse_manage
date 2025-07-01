import { startOfDay, endOfDay, isThisWeek, isSameMonth, isSameYear } from "date-fns"
import { ja } from "date-fns/locale"
import type { PeriodType } from "@/types/common"

export function filterDataByPeriod<T extends { date: Date }>(
  data: T[],
  selectedMonth: Date,
  period: PeriodType
): T[] {
  const now = new Date()

  switch (period) {
    case "daily":
      if (isSameMonth(selectedMonth, now) && isSameYear(selectedMonth, now)) {
        return data.filter((item) => item.date >= startOfDay(now) && item.date <= endOfDay(now))
      } else {
        // 選択した月の最後の日のデータを表示
        const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
        return data.filter(
          (item) =>
            item.date.getFullYear() === lastDayOfMonth.getFullYear() &&
            item.date.getMonth() === lastDayOfMonth.getMonth() &&
            item.date.getDate() === lastDayOfMonth.getDate()
        )
      }

    case "weekly":
      // 選択した月の週のデータ
      return data.filter(
        (item) =>
          item.date.getFullYear() === selectedMonth.getFullYear() &&
          item.date.getMonth() === selectedMonth.getMonth() &&
          isThisWeek(item.date, { locale: ja })
      )

    case "monthly":
      // 選択した月のデータ
      return data.filter(
        (item) =>
          item.date.getFullYear() === selectedMonth.getFullYear() &&
          item.date.getMonth() === selectedMonth.getMonth()
      )

    case "yearly":
      // 選択した月の年のデータ
      return data.filter((item) => item.date.getFullYear() === selectedMonth.getFullYear())

    default:
      return data
  }
}

export function getPeriodLabel(period: PeriodType): string {
  switch (period) {
    case "daily":
      return "日次売上"
    case "weekly":
      return "週次売上"
    case "monthly":
      return "月次売上"
    case "yearly":
      return "年次売上"
    default:
      return "売上"
  }
}

export function getComparisonLabel(period: PeriodType): string {
  switch (period) {
    case "daily":
      return "前日比"
    case "weekly":
      return "前週比"
    case "monthly":
      return "前月比"
    case "yearly":
      return "前年比"
    default:
      return "前期比"
  }
}