"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useProducts } from "@/context/products-context"
import { useSales } from "@/context/sales-context"
import { usePurchases } from "@/context/purchases-context"
import { useSettings } from "@/context/settings-context"
import { Loader2 } from "lucide-react"

export function DataMigration() {
  const [isMigrating, setIsMigrating] = useState(false)
  const { migrateFromLocalStorage: migrateProducts } = useProducts()
  const { migrateFromLocalStorage: migrateSales } = useSales()
  const { migrateFromLocalStorage: migratePurchases } = usePurchases()
  const { migrateFromLocalStorage: migrateSettings } = useSettings()

  const handleMigration = async () => {
    try {
      setIsMigrating(true)

      // 順番に移行を実行
      await migrateProducts()
      await migrateSales()
      await migratePurchases()
      await migrateSettings()
    } catch (error) {
      console.error("Migration error:", error)
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>データ移行</CardTitle>
        <CardDescription>ローカルストレージからデータベースへデータを移行します。</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          これまでブラウザのローカルストレージに保存されていたデータをSupabaseデータベースに移行します。
          この操作は一度だけ行ってください。既に存在するデータは重複して登録されません。
        </p>
        <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>注意:</strong> 移行処理中はページを閉じたり更新したりしないでください。
            データ量によっては処理に時間がかかる場合があります。
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleMigration} disabled={isMigrating}>
          {isMigrating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              移行中...
            </>
          ) : (
            "データ移行を実行"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
