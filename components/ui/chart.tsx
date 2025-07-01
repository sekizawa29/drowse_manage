"use client"

export {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
  Pie,
  PieChart,
  Line,
  LineChart,
  Area,
  AreaChart,
} from "recharts"

// チャートコンテナとツールチップのカスタムコンポーネント
import type * as React from "react"
import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  return (
    <div
      className={cn("h-80", className)}
      style={
        {
          "--color-chart-0": "hsl(var(--chart-0))",
          "--color-chart-1": "hsl(var(--chart-1))",
          "--color-chart-2": "hsl(var(--chart-2))",
          "--color-chart-3": "hsl(var(--chart-3))",
          "--color-chart-4": "hsl(var(--chart-4))",
          "--color-chart-5": "hsl(var(--chart-5))",
          ...Object.fromEntries(Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color])),
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartTooltip({ className, ...props }: ChartTooltipProps) {
  return <div className={cn("", className)} {...props} />
}

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      [key: string]: any
    }
  }>
  label?: string
  formatter?: (value: number, name: string, props: any) => [string, string]
  labelFormatter?: (label: string) => string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  className,
  ...props
}: ChartTooltipContentProps) {
  if (active && payload?.length) {
    return (
      <div className={cn("rounded-lg border bg-background p-2 shadow-sm", className)} {...props}>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {labelFormatter ? labelFormatter(label as string) : label}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {payload.map((data, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: data.payload.fill || data.color,
                  }}
                />
                <span className="text-[0.70rem] text-muted-foreground">{data.name}</span>
                <span className="font-medium">
                  {formatter ? formatter(data.value, data.name, data.payload)[0] : data.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
