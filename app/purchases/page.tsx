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
import { usePurchases, type PurchaseItem } from "@/context/purchases-context"
import { AddPurchaseDialog } from "@/components/purchases/add-purchase-dialog"
import { DeletePurchaseDialog } from "@/components/purchases/delete-purchase-dialog"
import { ImportPurchases } from "@/components/purchases/import-purchases"
import { ExportPurchases } from "@/components/purchases/export-purchases"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function PurchasesPage() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseItem | null>(null)
  const { purchases, isLoading } = usePurchases()

  // 検索とフィルタリング
  const filteredPurchases = purchases
    .filter((purchase) => {
      // 月フィルタリング (選択された月と同じ月のみ表示)
      const monthMatch =
        purchase.date.getFullYear() === selectedMonth.getFullYear() &&
        purchase.date.getMonth() === selectedMonth.getMonth()

      // 検索クエリによるフィルタリング
      const searchMatch = !searchQuery || purchase.productName.toLowerCase().includes(searchQuery.toLowerCase())

      return monthMatch && searchMatch
    })

    // 日付で降順ソート
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  const handleDeleteClick = (purchase: PurchaseItem) => {
    setSelectedPurchase(purchase)
    setDeleteDialogOpen(true)
  }

  // 仕入れ合計金額を計算
  const totalPurchaseAmount = filteredPurchases.reduce((sum, purchase) => sum + purchase.amount, 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">仕入れ管理</h2>
          <p className="text-muted-foreground">CBD製品の仕入れデータを管理します。</p>
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
            <ImportPurchases selectedMonth={selectedMonth} />
            <ExportPurchases selectedMonth={selectedMonth} />
          </div>
          <AddPurchaseDialog />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="製品名で検索..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <LoadingSpinner text="仕入れデータを読み込み中..." />
        ) : (
          <>
            {/* デスクトップ表示 */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>製品名</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead className="text-right">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.length > 0 ? (
                    filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>{format(purchase.date, "yyyy/MM/dd", { locale: ja })}</TableCell>
                        <TableCell>{purchase.productName}</TableCell>
                        <TableCell>¥{purchase.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive h-8 px-2"
                            onClick={() => handleDeleteClick(purchase)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">削除</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        該当するデータがありません
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredPurchases.length > 0 && (
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={2} className="font-medium">
                        合計
                      </TableCell>
                      <TableCell className="font-bold">¥{totalPurchaseAmount.toLocaleString()}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* モバイル表示 */}
            <div className="md:hidden">
              <div className="divide-y">
                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map((purchase) => (
                    <div key={purchase.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{purchase.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(purchase.date, "yyyy/MM/dd", { locale: ja })}
                          </div>
                        </div>
                        <div className="font-bold">¥{purchase.amount.toLocaleString()}</div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteClick(purchase)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> 削除
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">該当するデータがありません</div>
                )}
                {filteredPurchases.length > 0 && (
                  <div className="p-4 bg-muted/50 flex justify-between items-center">
                    <span className="font-medium">合計</span>
                    <span className="font-bold">¥{totalPurchaseAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 仕入れ削除確認ダイアログ */}
      <DeletePurchaseDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        purchaseId={selectedPurchase?.id || null}
      />
    </div>
  )
}
