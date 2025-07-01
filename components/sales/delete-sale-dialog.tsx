"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useSales } from "@/context/sales-context"

interface DeleteSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  saleId: string | null
}

export function DeleteSaleDialog({ open, onOpenChange, saleId }: DeleteSaleDialogProps) {
  const { removeSale } = useSales()

  const handleDelete = () => {
    if (saleId) {
      removeSale(saleId)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>売上記録を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は元に戻せません。この売上記録を削除すると、関連するすべてのデータが削除されます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
