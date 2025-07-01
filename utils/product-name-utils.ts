import { CHART_CONFIG } from "@/constants/ui-constants"

export function truncateProductName(name: string, maxLength: number = CHART_CONFIG.PRODUCT_NAME_MAX_LENGTH): string {
  if (name.length <= maxLength) return name
  return name.substring(0, maxLength) + "..."
}