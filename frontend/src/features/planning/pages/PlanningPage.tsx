import { useState } from 'react'
import Button from '../../../shared/components/Button'
import { useAuthStore } from '../../../store/authStore'
import { useCalendar } from '../hooks/usePlanning'
import type { Lesson } from '../types'
import {
  addDays,
  formatDayHeader,
  getWeekStart,
  todayStr,
} from '../utils/calendarLayout'
import LessonDetailDrawer from '../components/LessonDetailDrawer'
import LessonFormDrawer from '../components/LessonFormDrawer'
import WeekCalendar from '../components/WeekCalendar'

export default function PlanningPage() {
  const { hasRole } = useAuthStore()
  const canCreate   = hasRole('admin') || hasRole('secretaire')

  const [weekStart, setWeekStart] = useState(() => getWeekStart(todayStr()))

  const [formOpen, setFormOpen]         = useState(false)
  const [initialDate, setInitialDate]   = useState<string>()
  const [initialTime, setInitialTime]   = useState<string>()
  const [editLesson, setEditLesson]     = useState<Lesson | null>(null)

  const [detailOpen, setDetailOpen]     = useState(false)
  const [selectedLesson, setSelected]   = useState<Lesson | null>(null)

  const weekEnd = addDays(weekStart, 6)

  const { data, isLoading } = useCalendar({
    date_from: weekStart,
    date_to:   weekEnd,
  })

  const prevWeek = () => setWeekStart((w) => addDays(w, -7))
  const nextWeek = () => setWeekStart((w) => addDays(w, 7))
  const goToday  = () => setWeekStart(getWeekStart(todayStr()))

  const handleSlotClick = (date: string, time: string) => {
    if (!canCreate) return
    setInitialDate(date)
    setInitialTime(time)
    setEditLesson(null)
    setFormOpen(true)
  }

  const handleLessonClick = (lesson: Lesson) => {
    setSelected(lesson)
    setDetailOpen(true)
  }

  const handleEdit = (lesson: Lesson) => {
    setEditLesson(lesson)
    setInitialDate(undefined)
    setInitialTime(undefined)
    setFormOpen(true)
  }

  const { short: startShort, date: startDate } = formatDayHeader(weekStart)
  const { short: endShort,   date: endDate   } = formatDayHeader(weekEnd)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {startShort} {startDate} – {endShort} {endDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={prevWeek} type="button">‹</Button>
          <Button variant="secondary" size="sm" onClick={goToday} type="button">Aujourd'hui</Button>
          <Button variant="secondary" size="sm" onClick={nextWeek} type="button">›</Button>
          {canCreate && (
            <Button size="sm" onClick={() => { setEditLesson(null); setInitialDate(undefined); setInitialTime(undefined); setFormOpen(true) }} type="button">
              + Séance
            </Button>
          )}
        </div>
      </div>

      {/* Calendar */}
      <WeekCalendar
        weekStart={weekStart}
        data={data ?? {}}
        isLoading={isLoading}
        onSlotClick={handleSlotClick}
        onLessonClick={handleLessonClick}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {[
          { color: 'bg-indigo-400', label: 'Conduite' },
          { color: 'bg-emerald-400', label: 'Code' },
          { color: 'bg-amber-400', label: 'Accompagnement' },
          { color: 'bg-purple-400', label: 'Bilan' },
          { color: 'bg-red-400', label: 'Examen blanc' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
            {label}
          </div>
        ))}
        <span className="text-gray-300">·</span>
        <span>Cliquez sur un créneau vide pour créer une séance.</span>
      </div>

      {/* Drawers */}
      <LessonFormDrawer
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditLesson(null) }}
        initialDate={initialDate}
        initialStartTime={initialTime}
        editLesson={editLesson}
      />

      <LessonDetailDrawer
        lesson={selectedLesson}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelected(null) }}
        onEdit={handleEdit}
      />
    </div>
  )
}
