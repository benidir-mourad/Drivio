import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useExamStats } from '../hooks/useExamens'
import { EXAM_TYPE_LABELS } from '../types'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

const TYPE_COLORS: Record<string, string> = {
  theorique:          '#6366f1',
  pratique:           '#10b981',
  reexamen_theorique: '#f59e0b',
  reexamen_pratique:  '#ef4444',
}

export default function ExamenStatsPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const { data, isLoading } = useExamStats(year)

  const chartData = data
    ? Object.entries(data)
        .filter(([, s]) => s.total > 0)
        .map(([type, s]) => ({
          name:   EXAM_TYPE_LABELS[type as keyof typeof EXAM_TYPE_LABELS] ?? type,
          type,
          total:  s.total,
          réussi: s.passed,
          échoué: s.failed,
          absent: s.absent,
          taux:   s.rate,
        }))
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques examens</h1>
          <p className="text-sm text-gray-500 mt-0.5">Taux de réussite par type d'examen</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {isLoading && <div className="py-16 text-center text-gray-400">Chargement…</div>}

      {!isLoading && chartData.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          Aucune donnée pour {year}.
        </div>
      )}

      {chartData.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(data ?? {}).map(([type, s]) => (
              <div key={type} className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                  {EXAM_TYPE_LABELS[type as keyof typeof EXAM_TYPE_LABELS]}
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: TYPE_COLORS[type] ?? '#6b7280' }}>
                  {s.rate != null ? `${s.rate}%` : '—'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {s.passed}/{s.total} réussi{s.passed !== 1 ? 's' : ''}
                </p>
                {s.avg_score != null && (
                  <p className="text-xs text-gray-400">Moy. {s.avg_score}/50</p>
                )}
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Résultats détaillés — {year}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [value, String(name)]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="réussi" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="échoué" stackId="a" fill="#ef4444" />
                <Bar dataKey="absent" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pass rate chart */}
          {chartData.some((d) => d.taux != null) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Taux de réussite (%)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Taux de réussite']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="taux" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.type} fill={TYPE_COLORS[entry.type] ?? '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
