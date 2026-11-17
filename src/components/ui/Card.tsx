import React from 'react'
import { cn } from '../../lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'command' | 'interactive' | 'alert'
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-slate-200 shadow-xs',
    command: 'bg-[#0B192C] text-white border border-slate-700 shadow-md',
    interactive:
      'bg-white border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer',
    alert: 'bg-red-50/50 border border-red-200',
  }

  return (
    <div className={cn('rounded-md overflow-hidden', variantStyles[variant], className)} {...props}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('px-4 py-3 border-b border-slate-100 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-sm font-semibold tracking-tight text-slate-900', className)} {...props}>
    {children}
  </h3>
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-4', className)} {...props}>
    {children}
  </div>
)

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500', className)} {...props}>
    {children}
  </div>
)
