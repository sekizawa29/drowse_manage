"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useSales } from "@/context/sales-context"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

export function RecentSales() {
  const { sales } = useSales()

  // 最新の5件を表示
  const recentSales = sales.slice(0, 5)

  return (
    <div className="space-y-8">
      {recentSales.length > 0 ? (
        recentSales.map((sale) => (
          <div key={sale.id} className="flex items-center">
            <Avatar className="h-9 w-9 mr-3">
              <AvatarFallback className="bg-green-100 text-green-800">CBD</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{sale.productName}</p>
              <p className="text-sm text-muted-foreground">{format(sale.date, "yyyy年M月d日 HH:mm", { locale: ja })}</p>
            </div>
            <div className="ml-auto font-medium">
              <Badge variant="outline" className="ml-2">
                {sale.category}
              </Badge>
              <span className="ml-2">¥{sale.amount.toLocaleString()}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4">売上データがありません</div>
      )}
    </div>
  )
}
