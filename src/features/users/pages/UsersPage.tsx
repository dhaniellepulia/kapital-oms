import { useMemo, useState } from 'react'
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useUpdateUserRole, useUsers } from '@/features/users/hooks/useUsers'
import type { UserProfile, UserRole } from '@/features/users/types'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { RoleBadge } from '../components/RoleBadge'

const headerCellClass = 'text-[10.5px] font-medium tracking-[0.08em] text-dim uppercase'

const headerCells: { label: string; className?: string }[] = [
  { label: 'User' },
  { label: 'Role' },
  { label: 'Joined' },
  { label: 'Actions', className: 'text-center' },
]

const youTag = (
  <span className="inline-flex h-4 shrink-0 items-center rounded-full bg-accent px-1.5 text-[9px] font-semibold text-accent-foreground">
    You
  </span>
)

function UsersTableHeader() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {headerCells.map(({ label, className }) => (
          <TableHead key={label} className={cn(headerCellClass, className)}>
            {label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}

function UsersTableSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table className="min-w-[960px]">
        <UsersTableHeader />
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3.5 w-24" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto size-6 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function UsersCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function UsersPage() {
  const { user } = useAuth()
  const { data: users, isLoading, isError, error } = useUsers()
  const roleMutation = useUpdateUserRole()

  const [query, setQuery] = useState('')
  const [userToUpdate, setUserToUpdate] = useState<UserProfile | null>(null)

  const total = users?.length ?? 0
  const currentUid = user?.uid

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (users ?? []).filter(
      (u) =>
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    )
  }, [users, query])

  const targetRole: UserRole = userToUpdate?.role === 'admin' ? 'user' : 'admin'

  const updateError = roleMutation.isError
    ? roleMutation.error instanceof Error
      ? roleMutation.error.message
      : 'Failed to update role'
    : null

  const confirmRoleChange = async () => {
    if (!userToUpdate) return
    await roleMutation.mutateAsync({ uid: userToUpdate.uid, role: targetRole })
    setUserToUpdate(null)
  }

  const actionsMenu = (u: UserProfile) => {
    const isCurrent = u.uid === currentUid
    const label = u.role === 'admin' ? 'Make user' : 'Make admin'
    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={isCurrent || roleMutation.isPending}
            onClick={() => setUserToUpdate(u)}
          >
            {label}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl tracking-tight text-foreground">Users</h1>
        <p className="mt-1 text-xs text-muted-foreground">{total} users</p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-dim" />
        <Input
          className="h-9 pl-9"
          placeholder="Search by name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <>
          <div className="hidden md:block">
            <UsersTableSkeleton />
          </div>
          <div className="md:hidden">
            <UsersCardSkeleton />
          </div>
        </>
      ) : isError ? (
        <ErrorBanner message={error instanceof Error ? error.message : 'Failed to load users'} />
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
          <p className="font-heading text-base font-medium">No users yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Invite users to give them access to the OMS.
          </p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground shadow-sm">
          No users match your search.
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="rounded-xl border bg-card shadow-sm">
              <Table className="min-w-[960px]">
                <UsersTableHeader />
                <TableBody>
                  {filteredUsers.map((u) => {
                    const isCurrent = u.uid === currentUid
                    return (
                      <TableRow key={u.uid}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserAvatar name={u.name} />
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                                <span className="truncate">{u.name}</span>
                                {isCurrent && youTag}
                              </p>
                              <p className="text-[11px] text-dim">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={u.role} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(u.createdAt)}</TableCell>
                        <TableCell className="text-center">{actionsMenu(u)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {filteredUsers.map((u) => {
              const isCurrent = u.uid === currentUid
              return (
                <Card key={u.uid} className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar name={u.name} />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate text-[13px] font-medium text-foreground">
                          <span className="truncate">{u.name}</span>
                          {isCurrent && youTag}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-dim">{u.email}</p>
                      </div>
                    </div>
                    <RoleBadge role={u.role} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-dim">Joined {formatDate(u.createdAt)}</p>
                    {actionsMenu(u)}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(userToUpdate)}
        onOpenChange={(open) => {
          if (!open) {
            setUserToUpdate(null)
            roleMutation.reset()
          }
        }}
        title={
          userToUpdate
            ? `Make ${userToUpdate.name} ${targetRole === 'admin' ? 'an admin' : 'a user'}?`
            : 'Change role'
        }
        description={
          userToUpdate
            ? `Change ${userToUpdate.name}'s role from ${userToUpdate.role} to ${targetRole}.${
                updateError ? ` ${updateError}` : ''
              }`
            : undefined
        }
        confirmLabel={targetRole === 'admin' ? 'Make admin' : 'Make user'}
        isPending={roleMutation.isPending}
        onConfirm={() => void confirmRoleChange()}
      />
    </div>
  )
}
