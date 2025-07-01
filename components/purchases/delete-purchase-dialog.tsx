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
import { usePurchases } from "@/context/purchases-context"

interface DeletePurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseId: string | null
}

export function DeletePurchaseDialog({ open, onOpenChange, purchaseId }: DeletePurchaseDialogProps) {
  const { removePurchase } = usePurchases()

  const handleDelete = () => {
    if (purchaseId) {
      removePurchase(purchaseId)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>仕入れ記録を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は元に戻せません。この仕入れ記録を削除すると、関連するすべてのデータが削除されます。
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
