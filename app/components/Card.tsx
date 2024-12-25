import { Card as CardUI, CardContent } from "@/app/components/ui/card"

interface CardProps {
  card: {
    value: string
    suit: string
  }
}

export default function Card({ card }: CardProps) {
  const { value, suit } = card
  const color = suit === '♥' || suit === '♦' ? 'text-red-500' : 'text-black'

  return (
    <CardUI className="w-16 h-24 sm:w-20 sm:h-28 flex items-center justify-center">
      <CardContent className={`text-2xl font-bold ${color}`}>
        {value}{suit}
      </CardContent>
    </CardUI>
  )
}