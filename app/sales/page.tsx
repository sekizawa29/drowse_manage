import type { Metadata } from "next"
import SalesPageClient from "./SalesPageClient"

export const metadata: Metadata = {
  title: "売上管理 - CBD製品販売管理システム",
  description: "CBD製品の売上データを管理します。",
}

export default function SalesPage() {
  return <SalesPageClient />
}
