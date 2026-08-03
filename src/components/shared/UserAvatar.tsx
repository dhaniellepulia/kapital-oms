import { cn } from '@/lib/utils'

const AVATAR_PALETTE = [
  'bg-[#e6edff] text-[#2a4bd3] dark:bg-[#1d2a52] dark:text-[#9db8ff]',
  'bg-[#e4f5ea] text-[#17743f] dark:bg-[#143023] dark:text-[#6fe0a0]',
  'bg-[#fcf1dc] text-[#96610c] dark:bg-[#32290f] dark:text-[#f2c14e]',
  'bg-[#efebfd] text-[#6643c0] dark:bg-[#2a2150] dark:text-[#b9a2f5]',
  'bg-[#fce9ee] text-[#b53a5e] dark:bg-[#3a1f2b] dark:text-[#f29cb4]',
  'bg-[#e1f3f3] text-[#0e7978] dark:bg-[#12302f] dark:text-[#5fd6d3]',
  'bg-[#eef0f4] text-[#4b5567] dark:bg-[#23272d] dark:text-[#aab3c0]',
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
