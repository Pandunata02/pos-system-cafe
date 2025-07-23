import { formatRupiah } from "@/lib/excel-export"

interface CurrencyDisplayProps {
  amount: number
  className?: string
}

export function CurrencyDisplay({ amount, className }: CurrencyDisplayProps) {
  return <span className={className}>{formatRupiah(amount)}</span>
}
