import { Star } from 'lucide-react'

interface Props {
  rating: number
  max?: number
  size?: number
  interactive?: boolean
  onChange?: (r: number) => void
}

export default function StarRating({ rating, max = 5, size = 14, interactive = false, onChange }: Props) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating)
        return (
          <Star
            key={i}
            size={size}
            className={`${filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onChange && onChange(i + 1)}
          />
        )
      })}
    </div>
  )
}
