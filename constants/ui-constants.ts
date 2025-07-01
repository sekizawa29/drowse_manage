export const CHART_CONFIG = {
  HEIGHT: 300,
  OUTER_RADIUS: 60,
  MIN_PERCENTAGE_FOR_LABEL: 10,
  PRODUCT_NAME_MAX_LENGTH: 15,
} as const

export const CHART_COLOR_PALETTE = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-0))",
  "hsl(142, 76%, 36%)", // 緑
  "hsl(258, 90%, 66%)", // 紫
  "hsl(24, 95%, 53%)",  // オレンジ
  "hsl(199, 89%, 48%)", // ブルー
  "hsl(343, 81%, 54%)", // ピンク
  "hsl(48, 96%, 53%)",  // 黄色
] as const