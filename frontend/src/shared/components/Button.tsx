import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-indigo-600 text-white border-transparent hover:bg-indigo-700',
  secondary: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
  danger:    'bg-red-600 text-white border-transparent hover:bg-red-700',
  success:   'bg-emerald-600 text-white border-transparent hover:bg-emerald-700',
  ghost:     'bg-transparent text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100',
  outline:   'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50',
}

const SIZES: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-2.5 text-sm rounded-lg gap-2',
}

interface BaseProps {
  children: ReactNode
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  className?: string
}

interface ButtonProps extends BaseProps {
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  to?: undefined
  href?: undefined
}

interface LinkProps extends BaseProps {
  to: string
  type?: undefined
  onClick?: undefined
  href?: undefined
}

type Props = ButtonProps | LinkProps

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...rest
}: Props) {
  const base = 'inline-flex items-center justify-center border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const cls = `${base} ${VARIANTS[variant]} ${SIZES[size]} ${className}`
  const isDisabled = disabled || loading

  const inner = (
    <>
      {loading && <span className="mr-1 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </>
  )

  if ('to' in rest && rest.to) {
    const { to } = rest
    return (
      <Link to={to} className={isDisabled ? `${cls} pointer-events-none opacity-50` : cls}>
        {inner}
      </Link>
    )
  }

  const { type = 'button', onClick } = rest as ButtonProps
  return (
    <button type={type} disabled={isDisabled} onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}
