import React from 'react'
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { useVanguardStore } from '../../store/useVanguardStore'
import { cn } from '../../lib/utils'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useVanguardStore()

  if (toasts.length === 0) return null

  const icons = {
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
  }

  const borderStyles = {
    info: 'border-l-4 border-l-blue-500',
    success: 'border-l-4 border-l-emerald-500',
    warning: 'border-l-4 border-l-amber-500',
    error: 'border-l-4 border-l-red-500',
  }

  return (
    <div className="fixed bottom-10 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto bg-white rounded shadow-lg border border-slate-200 p-3.5 flex items-start gap-3 transition-all transform translate-y-0',
            borderStyles[toast.type]
          )}
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-900">{toast.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
