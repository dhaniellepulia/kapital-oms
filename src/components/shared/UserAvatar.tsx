import { cn } from '@/lib/utils'

const AVATAR_PALETTE = [
  'bg-[#e6edff] text-[#2a4bd3]',
  'bg-[#e4f5ea] text-[#17743f]',
  'bg-[#fcf1dc] text-[#96610c]',
  'bg-[#efebfd] text-[#6643c0]',
  'bg-[#fce9ee] text-[#b53a5e]',
  'bg-[#e1f3f3] text-[#0e7978]',
  'bg-[#eef0f4] text-[#4b5567]',
]

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + second).toUpperCase()
}

interface UserAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'size-6 text-[9px]',
  md: 'size-8 text-[11px]',
  lg: 'size-[30px] text-[10px]',
} as const

export function UserAvatar({ name, size = 'md', className }: UserAvatarProps) {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const palette = AVATAR_PALETTE[hash % AVATAR_PALETTE.length]

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-semibold',
        palette,
        SIZE_CLASSES[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
