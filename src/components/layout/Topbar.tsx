import { Menu } from 'lucide-react'

import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  userName: string
  onMenuClick: () => void
}

export function Topbar({ userName, onMenuClick }: TopbarProps) {
  return (
    <header className="flex h-[60px] shrink-0 items-center gap-3.5 border-b border-border px-7 max-[720px]:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="hidden size-9 rounded-[10px] border border-border max-[900px]:inline-flex"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        <Menu className="size-[17px]" />
      </Button>
      <div className="ml-auto flex items-center">
        <UserAvatar name={userName} size="md" />
      </div>
    </header>
  )
}
