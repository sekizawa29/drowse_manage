"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSalespersons, type Salesperson } from "@/context/salespersons-context"
import { Plus, Edit } from "lucide-react"

interface SalespersonDialogProps {
  salesperson?: Salesperson
  trigger?: React.ReactNode
}

export function SalespersonDialog({ salesperson, trigger }: SalespersonDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(salesperson?.name || "")
  const [email, setEmail] = useState(salesperson?.email || "")
  const [phone, setPhone] = useState(salesperson?.phone || "")
  const [isActive, setIsActive] = useState(salesperson?.isActive ?? true)
  const [isLoading, setIsLoading] = useState(false)

  const { addSalesperson, updateSalesperson } = useSalespersons()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      if (salesperson) {
        await updateSalesperson(salesperson.id, {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          isActive,
        })
      } else {
        await addSalesperson({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          isActive,
        })
      }
      setOpen(false)
      if (!salesperson) {
        setName("")
        setEmail("")
        setPhone("")
        setIsActive(true)
      }
    } catch (error) {
      // エラーはコンテキストで処理される
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={salesperson ? "ghost" : "default"} size={salesperson ? "sm" : "default"}>
            {salesperson ? <Edit className="h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {salesperson ? "" : "販売者を追加"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{salesperson ? "販売者を編集" : "販売者を追加"}</DialogTitle>
            <DialogDescription>
              {salesperson ? "販売者情報を編集してください。" : "新しい販売者を追加してください。"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名前 *
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                メール
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                電話番号
              </Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                有効
              </Label>
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "保存中..." : salesperson ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
