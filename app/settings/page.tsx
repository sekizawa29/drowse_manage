"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/context/settings-context"
import { useToast } from "@/hooks/use-toast"
import { DataMigration } from "@/components/settings/data-migration"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { salesTargets, updateSalesTargets, isLoading } = useSettings()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  // フォーム状態
  const [monthlyTarget, setMonthlyTarget] = useState(salesTargets.monthly.toString())
  const [yearlyTarget, setYearlyTarget] = useState(salesTargets.yearly.toString())
  const [dailyTarget, setDailyTarget] = useState(salesTargets.daily.toString())
  const [weeklyTarget, setWeeklyTarget] = useState(salesTargets.weekly.toString())

  // 売上目標設定の保存
  const handleSaveTargets = async () => {
    try {
      setIsSaving(true)
      const newTargets = {
        daily: Number(dailyTarget) || salesTargets.daily,
        weekly: Number(weeklyTarget) || salesTargets.weekly,
        monthly: Number(monthlyTarget) || salesTargets.monthly,
        yearly: Number(yearlyTarget) || salesTargets.yearly,
      }

      await updateSalesTargets(newTargets)
    } catch (error) {
      console.error("Failed to save targets:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // 設定データの読み込み中
  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>設定を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">設定</h2>
        <p className="text-muted-foreground">アカウント設定やシステム設定を管理します。</p>
      </div>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">アカウント</TabsTrigger>
          <TabsTrigger value="system">システム</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="database">データベース</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>アカウント情報</CardTitle>
              <CardDescription>アカウント情報を変更します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">名前</Label>
                <Input id="name" defaultValue="オーナー" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" defaultValue="owner@example.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>保存</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>パスワード変更</CardTitle>
              <CardDescription>アカウントのパスワードを変更します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">現在のパスワード</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新しいパスワード</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">パスワード確認</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>パスワード変更</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>システム設定</CardTitle>
              <CardDescription>システムの基本設定を変更します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop-name">ショップ名</Label>
                <Input id="shop-name" defaultValue="CBD製品オンラインショップ" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">通貨</Label>
                <Input id="currency" defaultValue="JPY (¥)" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="tax-included" defaultChecked />
                <Label htmlFor="tax-included">税込表示</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button>保存</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>売上目標設定</CardTitle>
              <CardDescription>日次・週次・月間・年間の売上目標を設定します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="daily-target">日次目標 (円)</Label>
                <Input id="daily-target" value={dailyTarget} onChange={(e) => setDailyTarget(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekly-target">週次目標 (円)</Label>
                <Input id="weekly-target" value={weeklyTarget} onChange={(e) => setWeeklyTarget(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-target">月間目標 (円)</Label>
                <Input id="monthly-target" value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearly-target">年間目標 (円)</Label>
                <Input id="yearly-target" value={yearlyTarget} onChange={(e) => setYearlyTarget(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveTargets} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "保存"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>システムからの通知設定を管理します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sales-report">売上レポート</Label>
                  <p className="text-sm text-muted-foreground">週次・月次の売上レポートをメールで受け取る</p>
                </div>
                <Switch id="sales-report" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="low-stock">在庫アラート</Label>
                  <p className="text-sm text-muted-foreground">在庫が少なくなった時に通知を受け取る</p>
                </div>
                <Switch id="low-stock" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="goal-achievement">目標達成通知</Label>
                  <p className="text-sm text-muted-foreground">売上目標を達成した時に通知を受け取る</p>
                </div>
                <Switch id="goal-achievement" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="database" className="space-y-4">
          <DataMigration />
        </TabsContent>
      </Tabs>
    </div>
  )
}
