import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastAction {
  label: string
  onClick: () => void
}

interface Toast {
  id: number
  message: string
  type: ToastType
  action?: ToastAction | null
}

type AddToast = (message: string, type?: ToastType, duration?: number, action?: ToastAction | null) => void

const ToastContext = createContext<AddToast | null>(null)

let nextId = 0

const TYPE_STYLES: Record<ToastType, { bar: string; icon: string }> = {
  success: { bar: 'bg-emerald-500', icon: 'text-emerald-600' },
  error:   { bar: 'bg-red-500',     icon: 'text-red-600' },
  warning: { bar: 'bg-amber-500',   icon: 'text-amber-600' },
  info:    { bar: 'bg-blue-500',    icon: 'text-blue-600' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback<AddToast>((message, type = 'info', duration = 4000, action = null) => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message, type, action }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => {
            const cfg = TYPE_STYLES[toast.type]
            return (
              <div
                key={toast.id}
                className="toast-enter flex items-start gap-3 rounded-xl bg-white border border-gray-200 shadow-lg pointer-events-auto overflow-hidden"
              >
                <div className={`w-1 self-stretch shrink-0 rounded-l-xl ${cfg.bar}`} />
                <span className={`py-3 text-xs font-bold ${cfg.icon}`}>{toast.type.toUpperCase()}</span>
                <span className="flex-1 py-3 text-sm text-gray-800">{toast.message}</span>
                {toast.action && (
                  <button
                    onClick={() => { toast.action!.onClick(); dismiss(toast.id) }}
                    className="my-3 shrink-0 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {toast.action.label}
                  </button>
                )}
                <button
                  onClick={() => dismiss(toast.id)}
                  aria-label="Fermer"
                  className="mr-2 mt-2.5 shrink-0 h-6 w-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): AddToast {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
