'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

function Popover({ children, ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>
}

function PopoverTrigger({ children, ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    // asChild so we can pass a button
    <PopoverPrimitive.Trigger asChild {...props}>{children}</PopoverPrimitive.Trigger>
  )
}

function PopoverContent({ className, side = 'bottom', align = 'center', children, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content> & { className?: string }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        side={side}
        align={align}
        className={cn('bg-popover text-popover-foreground rounded-md shadow-md p-2', className)}
        {...props}
      >
        {children}
        <PopoverPrimitive.Arrow className="fill-popover" />
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverTrigger, PopoverContent }
