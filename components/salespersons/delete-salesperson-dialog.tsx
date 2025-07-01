"use client"

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
import { useSalespersons, type Salesperson } from "@/context/salespersons-context"
import { Trash2 } from "lucide-react"

interface DeleteSalespersonDialogProps {
  salesperson: Salesperson
}

export function DeleteSalespersonDialog({ salesperson }: DeleteSalespersonDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { removeSalesperson } = useSalespersons()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await removeSalesperson(salesperson.id)
      setOpen(false)
    } catch (error) {
      // エラーはコンテキストで処理される
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>販売者を削除</DialogTitle>
          <DialogDescription>
            「{salesperson.name}」を削除してもよろしいですか？
            <br />
            この操作は取り消すことができません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "削除中..." : "削除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
