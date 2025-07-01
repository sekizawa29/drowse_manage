import type { Metadata } from "next"
import ReportsPageClient from "./ReportsPageClient"

export const metadata: Metadata = {
  title: "レポート - CBD製品販売管理システム",
  description: "CBD製品の売上レポートを生成・閲覧します。",
}

export default function ReportsPage() {
  return <ReportsPageClient />
}
