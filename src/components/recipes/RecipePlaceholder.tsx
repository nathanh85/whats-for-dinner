import type { LucideIcon } from 'lucide-react'
import {
  Sun,
  Drumstick,
  Layers,
  Sandwich,
  Utensils,
  Pizza,
  UtensilsCrossed,
  Soup,
  Salad,
  Fish,
  Beef,
  ChefHat,
} from 'lucide-react'

type CategoryConfig = {
  bg: string
  iconColor: string
  Icon: LucideIcon
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Breakfast:  { bg: '#FEF3C7', iconColor: '#92400E', Icon: Sun },
  Chicken:    { bg: '#FDE68A', iconColor: '#78350F', Icon: Drumstick },
  Burgers:    { bg: '#FECACA', iconColor: '#7F1D1D', Icon: Layers },
  Sandwiches: { bg: '#FED7AA', iconColor: '#7C2D12', Icon: Sandwich },
  Pasta:      { bg: '#FFEDD5', iconColor: '#7C2D12', Icon: Utensils },
  Pizza:      { bg: '#FEE2E2', iconColor: '#7F1D1D', Icon: Pizza },
  Tacos:      { bg: '#D9F99D', iconColor: '#365314', Icon: UtensilsCrossed },
  Soups:      { bg: '#FED7AA', iconColor: '#7C2D12', Icon: Soup },
  Bowls:      { bg: '#CCFBF1', iconColor: '#134E4A', Icon: Salad },
  Seafood:    { bg: '#DBEAFE', iconColor: '#1E3A5F', Icon: Fish },
  Beef:       { bg: '#FECDD3', iconColor: '#881337', Icon: Beef },
  Appetizers: { bg: '#EDE9FE', iconColor: '#4C1D95', Icon: ChefHat },
}

const DEFAULT_CONFIG: CategoryConfig = {
  bg: '#F5F5F4',
  iconColor: '#78716C',
  Icon: Utensils,
}

export default function RecipePlaceholder({
  category,
  iconSize = 'md',
  className = '',
}: {
  category: string | null
  iconSize?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const config = (category ? CATEGORY_CONFIG[category] : undefined) ?? DEFAULT_CONFIG
  const { bg, iconColor, Icon } = config

  const iconClass =
    iconSize === 'sm' ? 'h-6 w-6' :
    iconSize === 'lg' ? 'h-12 w-12' :
    'h-8 w-8'

  return (
    <div
      className={`flex items-center justify-center rounded-lg ${className}`}
      style={{ backgroundColor: bg }}
    >
      <Icon className={iconClass} style={{ color: iconColor }} />
    </div>
  )
}
