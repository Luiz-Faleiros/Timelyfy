"use client"

import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { Button } from './button'
import { cn } from '@/lib/utils'

const AlertDialog = (props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) => (
  <AlertDialogPrimitive.Root {...props} />
)

const AlertDialogTrigger = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger>
>((props, ref) => {
  return <AlertDialogPrimitive.Trigger ref={ref} asChild {...props} />
})
AlertDialogTrigger.displayName = 'AlertDialogTrigger'

const AlertDialogPortal = (props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) => {
  return <AlertDialogPrimitive.Portal {...props} />
}
AlertDialogPortal.displayName = 'AlertDialogPortal'

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <AlertDialogPrimitive.Overlay ref={ref} className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm', className)} {...props} />
  )
})
AlertDialogOverlay.displayName = 'AlertDialogOverlay'

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & { className?: string }
>(({ className, children, ...props }, ref) => {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content ref={ref} className={cn('fixed z-50 top-[50%] left-[50%] w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-popover p-4 shadow-lg', className)} {...props}>
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
})
AlertDialogContent.displayName = 'AlertDialogContent'

function AlertDialogTitle({ children, className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props}>
      {children}
    </AlertDialogPrimitive.Title>
  )
}

function AlertDialogDescription({ children, className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </AlertDialogPrimitive.Description>
  )
}

function AlertDialogAction({ children, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return <AlertDialogPrimitive.Action asChild {...props}><Button>{children}</Button></AlertDialogPrimitive.Action>
}

function AlertDialogCancel({ children, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel asChild {...props}><Button variant="ghost">{children}</Button></AlertDialogPrimitive.Cancel>
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

export default AlertDialog
