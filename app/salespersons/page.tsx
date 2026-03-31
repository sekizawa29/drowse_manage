"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSalespersons } from "@/context/salespersons-context"
import { SalespersonDialog } from "@/components/salespersons/salesperson-dialog"
import { DeleteSalespersonDialog } from "@/components/salespersons/delete-salesperson-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Search, Users } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

export default function SalespersonsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { salespersons, isLoading } = useSalespersons()

  const filteredSalespersons = salespersons.filter(
    (salesperson) =>
      salesperson.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (salesperson.email && salesperson.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (isLoading) {
    return (
      <div className="flex-1 p-3 md:p-8 pt-3 md:pt-6">
        <LoadingSpinner text="販売者データを読み込み中..." />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-3 md:space-y-4 p-3 md:p-8 pt-3 md:pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">販売者管理</h2>
          <p className="text-sm md:text-base text-muted-foreground">販売スタッフの情報を管理します</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <SalespersonDialog />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="販売者を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSalespersons.map((salesperson) => (
          <Card key={salesperson.id}>
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Users className="h-4 w-4 shrink-0" />
                  <CardTitle className="text-sm font-medium truncate">{salesperson.name}</CardTitle>
                </div>
                <Badge variant={salesperson.isActive ? "default" : "secondary"} className="shrink-0">
                  {salesperson.isActive ? "有効" : "無効"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-1.5 md:space-y-2">
                {salesperson.email && <p className="text-sm text-muted-foreground">メール: {salesperson.email}</p>}
                {salesperson.phone && <p className="text-sm text-muted-foreground">電話: {salesperson.phone}</p>}
                <p className="text-xs text-muted-foreground">
                  登録日: {format(salesperson.createdAt, "yyyy年M月d日", { locale: ja })}
                </p>
              </div>
              <div className="mt-3 md:mt-4 flex flex-wrap justify-end gap-2">
                <SalespersonDialog salesperson={salesperson} />
                {salesperson.isActive && <DeleteSalespersonDialog salesperson={salesperson} />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSalespersons.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">販売者が見つかりません</p>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "検索条件に一致する販売者がいません" : "まだ販売者が登録されていません"}
            </p>
            {!searchTerm && <SalespersonDialog />}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
