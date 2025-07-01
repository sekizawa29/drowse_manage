import type { Metadata } from "next"
import DashboardPageClient from "./DashboardPageClient"

// メタデータはサーバーコンポーネントでのみ使用可能なので、別ファイルに移動する必要があります
export const metadata: Metadata = {
  title: "CBD製品販売管理ダッシュボード",
  description: "CBD製品の売上を記録・可視化し、販売状況の判断や施策立案をサポートします。",
}

export default function DashboardPage() {
  return <DashboardPageClient />
}
