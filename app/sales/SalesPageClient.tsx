"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon, Search, Trash2 } from "lucide-react"
import { useSales, type SaleItem } from "@/context/sales-context"
import { AddSaleDialog } from "@/components/sales/add-sale-dialog"
import { DeleteSaleDialog } from "@/components/sales/delete-sale-dialog"
import { ImportSales } from "@/components/sales/import-sales"
import { ExportSales } from "@/components/sales/export-sales"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function SalesPageClient() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<SaleItem | null>(null)
  const { sales, isLoading } = useSales()

  // 検索とフィルタリング
  const filteredSales = sales
    .filter((sale) => {
      // 月フィルタリング (選択された月と同じ月のみ表示)
      const monthMatch =
        sale.date.getFullYear() === selectedMonth.getFullYear() && sale.date.getMonth() === selectedMonth.getMonth()

      // 検索クエリによるフィルタリング
      const searchMatch =
        !searchQuery ||
        sale.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sale.salespersonName && sale.salespersonName.toLowerCase().includes(searchQuery.toLowerCase()))

      return monthMatch && searchMatch
    })
    // 日付で降順ソート
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  const handleDeleteClick = (sale: SaleItem) => {
    setSelectedSale(sale)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">売上管理</h2>
          <p className="text-muted-foreground">CBD製品の売上データを管理・分析します。</p>
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
                onSelect={(date) => date && setSelectedMonth(date)}
                initialFocus
                locale={ja}
              />
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2">
            <ImportSales selectedMonth={selectedMonth} />
            <ExportSales selectedMonth={selectedMonth} />
          </div>
          <AddSaleDialog />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="製品名、カテゴリ、販売者で検索..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <LoadingSpinner text="売上データを読み込み中..." />
        ) : (
          <>
            {/* デスクトップ表示 */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>製品名</TableHead>
                    <TableHead>販売者</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead className="text-right">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{format(sale.date, "yyyy/MM/dd", { locale: ja })}</TableCell>
                        <TableCell>{sale.productName}</TableCell>
                        <TableCell>{sale.salespersonName || "不明"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{sale.category}</Badge>
                        </TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>¥{sale.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive h-8 px-2"
                            onClick={() => handleDeleteClick(sale)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">削除</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        該当するデータがありません
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* モバイル表示 */}
            <div className="md:hidden">
              <div className="divide-y">
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <div key={sale.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{sale.productName}</div>
                          <div className="text-sm text-muted-foreground">販売者: {sale.salespersonName || "不明"}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(sale.date, "yyyy/MM/dd", { locale: ja })}
                          </div>
                        </div>
                        <Badge variant="outline">{sale.category}</Badge>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm">
                          数量: <span className="font-medium">{sale.quantity}</span>
                        </div>
                        <div className="font-bold">¥{sale.amount.toLocaleString()}</div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteClick(sale)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> 削除
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">該当するデータがありません</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 売上削除確認ダイアログ */}
      <DeleteSaleDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} saleId={selectedSale?.id || null} />
    </div>
  )
}
