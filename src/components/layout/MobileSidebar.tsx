import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'

import { cn } from '@/lib/utils'
import { SidebarContent, type SidebarContentProps } from './Sidebar'

interface MobileSidebarProps extends SidebarContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange, ...contentProps }: MobileSidebarProps) {
  return (
    <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange} swipeDirection="left">
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Backdrop
          className="fixed inset-0 z-40 bg-black/40 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        <DrawerPrimitive.Popup
          className={cn(
            'fixed inset-y-0 left-0 z-50 h-full w-[260px] bg-sidebar shadow-xl outline-none',
            'data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-left',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-left',
          )}
        >
          <SidebarContent {...contentProps} />
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  )
}
