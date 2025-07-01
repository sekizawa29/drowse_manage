import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  text?: string
}

export function LoadingSpinner({ text = "読み込み中..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-40">
      <Loader2 className="h-8 w-8 animate-spin mb-2" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
