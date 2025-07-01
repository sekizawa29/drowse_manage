"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

interface Column<T> {
  key: string
  header: React.ReactNode
  cell: (item: T) => React.ReactNode
  className?: string
  mobileLabel?: string
  isVisible?: boolean | ((width: "sm" | "md" | "lg") => boolean)
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
  footer?: React.ReactNode
  className?: string
  isLoading?: boolean
  loadingComponent?: React.ReactNode
}

export function ResponsiveTable<T>({
  data,
  columns,
  emptyMessage = "データがありません",
  footer,
  className,
  isLoading,
  loadingComponent,
}: ResponsiveTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  // 行の展開状態を切り替える
  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // 表示する列をフィルタリング
  const getVisibleColumns = (width: "sm" | "md" | "lg") => {
    return columns.filter((column) => {
      if (typeof column.isVisible === "function") {
        return column.isVisible(width)
      }
      return column.isVisible !== false
    })
  }

  // デスクトップ用の列
  const desktopColumns = getVisibleColumns("lg")

  // モバイル用の列（最初の2列のみ表示）
  const mobileColumns = getVisibleColumns("sm").slice(0, 2)

  if (isLoading && loadingComponent) {
    return <div className="rounded-md border">{loadingComponent}</div>
  }

  return (
    <div className={cn("rounded-md border", className)}>
      {/* デスクトップ表示 */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {desktopColumns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index}>
                  {desktopColumns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={desktopColumns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {footer && <div className="border-t py-3 px-4">{footer}</div>}
      </div>

      {/* モバイル表示 */}
      <div className="md:hidden">
        <div className="divide-y">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={index} className="py-3 px-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleRow(index)}>
                  <div className="flex-1 space-y-1">
                    {mobileColumns.map((column) => (
                      <div key={column.key} className="flex items-center">
                        {column.cell(item)}
                      </div>
                    ))}
                  </div>
                  <div>
                    {expandedRows[index] ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* 展開時の詳細情報 */}
                {expandedRows[index] && (
                  <div className="mt-3 space-y-2 pt-2 border-t text-sm">
                    {desktopColumns
                      .filter((column) => !mobileColumns.some((mc) => mc.key === column.key))
                      .map((column) => (
                        <div key={column.key} className="flex justify-between items-center">
                          <span className="text-muted-foreground">{column.mobileLabel || column.header}</span>
                          <span>{column.cell(item)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">{emptyMessage}</div>
          )}
        </div>
        {footer && <div className="border-t py-3 px-4">{footer}</div>}
      </div>
    </div>
  )
}
