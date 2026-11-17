import React from 'react'
import { cn } from '../../lib/utils'
import { ClassificationLevel, OperationalStatus, SeverityLevel } from '../../types/common'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'critical'
    | 'warning'
    | 'nominal'
    | 'info'
    | 'neutral'
    | 'outline'
    | 'classification'
  dot?: boolean
  pulse?: boolean
  classification?: ClassificationLevel
  status?: OperationalStatus
  severity?: SeverityLevel
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  dot = false,
  pulse = false,
  classification,
  status,
  severity,
  children,
  ...props
}) => {
  let badgeClasses = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide uppercase'
  let dotColor = 'bg-slate-400'

  if (classification) {
    switch (classification) {
      case 'UNCLASSIFIED':
        badgeClasses += ' bg-emerald-700 text-white font-semibold'
        dotColor = 'bg-emerald-300'
        break
      case 'CUI':
        badgeClasses += ' bg-purple-800 text-white font-semibold'
        dotColor = 'bg-purple-300'
        break
      case 'SECRET':
        badgeClasses += ' bg-red-700 text-white font-semibold'
        dotColor = 'bg-red-300'
        break
      case 'TOP SECRET':
        badgeClasses += ' bg-amber-600 text-white font-bold'
        dotColor = 'bg-yellow-300'
        break
      default:
        badgeClasses += ' bg-slate-700 text-white'
    }
  } else if (status) {
    switch (status) {
      case 'NOMINAL':
        badgeClasses += ' bg-emerald-50 text-emerald-800 border border-emerald-300'
        dotColor = 'bg-emerald-500'
        break
      case 'ELEVATED':
      case 'DEGRADED':
        badgeClasses += ' bg-amber-50 text-amber-800 border border-amber-300'
        dotColor = 'bg-amber-500'
        break
      case 'CRITICAL':
      case 'OFFLINE':
        badgeClasses += ' bg-red-50 text-red-800 border border-red-300'
        dotColor = 'bg-red-500'
        break
    }
  } else if (severity) {
    switch (severity) {
      case 'CRITICAL':
        badgeClasses += ' bg-red-100 text-red-900 border border-red-300 font-bold'
        dotColor = 'bg-red-600'
        break
      case 'HIGH':
        badgeClasses += ' bg-amber-100 text-amber-900 border border-amber-300'
        dotColor = 'bg-amber-600'
        break
      case 'MEDIUM':
        badgeClasses += ' bg-blue-100 text-blue-900 border border-blue-300'
        dotColor = 'bg-blue-600'
        break
      case 'LOW':
        badgeClasses += ' bg-slate-100 text-slate-800 border border-slate-300'
        dotColor = 'bg-slate-500'
        break
    }
  } else {
    switch (variant) {
      case 'critical':
        badgeClasses += ' bg-red-50 text-red-700 border border-red-200'
        dotColor = 'bg-red-500'
        break
      case 'warning':
        badgeClasses += ' bg-amber-50 text-amber-700 border border-amber-200'
        dotColor = 'bg-amber-500'
        break
      case 'nominal':
        badgeClasses += ' bg-emerald-50 text-emerald-700 border border-emerald-200'
        dotColor = 'bg-emerald-500'
        break
      case 'info':
        badgeClasses += ' bg-blue-50 text-blue-700 border border-blue-200'
        dotColor = 'bg-blue-500'
        break
      case 'neutral':
        badgeClasses += ' bg-slate-100 text-slate-700 border border-slate-200'
        dotColor = 'bg-slate-400'
        break
      default:
        badgeClasses += ' bg-slate-100 text-slate-800'
    }
  }

  return (
    <span className={cn(badgeClasses, className)} {...props}>
      {dot && (
        <span className="relative flex h-2 w-2 mr-1.5">
          {pulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColor
              )}
            />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColor)} />
        </span>
      )}
      {children || classification || status || severity}
    </span>
  )
}
