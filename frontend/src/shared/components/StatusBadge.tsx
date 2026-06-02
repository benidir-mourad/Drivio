interface Props {
  status: string
  colorMap?: Record<string, string>
  labelMap?: Record<string, string>
}

const DEFAULT_COLORS: Record<string, string> = {
  active:      'bg-emerald-100 text-emerald-800',
  inactive:    'bg-gray-100 text-gray-700',
  suspended:   'bg-amber-100 text-amber-800',
  graduated:   'bg-blue-100 text-blue-800',
  available:   'bg-emerald-100 text-emerald-800',
  maintenance: 'bg-amber-100 text-amber-800',
  retired:     'bg-gray-100 text-gray-700',
}

const DEFAULT_LABELS: Record<string, string> = {
  active:      'Actif',
  inactive:    'Inactif',
  suspended:   'Suspendu',
  graduated:   'Diplômé',
  available:   'Disponible',
  maintenance: 'Maintenance',
  retired:     'Retiré',
}

export default function StatusBadge({ status, colorMap, labelMap }: Props) {
  const colors = colorMap ?? DEFAULT_COLORS
  const labels = labelMap ?? DEFAULT_LABELS
  const cls = colors[status] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {labels[status] ?? status}
    </span>
  )
}
