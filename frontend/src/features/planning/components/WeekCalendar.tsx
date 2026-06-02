import { useMemo } from 'react'
import type { CalendarData, Lesson } from '../types'
import {
  addDays,
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  computeDayLayout,
  formatDayHeader,
  PX_PER_MINUTE,
  todayStr,
  TOTAL_MINUTES,
} from '../utils/calendarLayout'
import LessonBlock from './LessonBlock'

interface Props {
  weekStart: string        // YYYY-MM-DD (Monday)
  data: CalendarData       // keyed by YYYY-MM-DD
  isLoading: boolean
  onSlotClick: (date: string, time: string) => void
  onLessonClick: (lesson: Lesson) => void
}

const CALENDAR_HEIGHT = TOTAL_MINUTES * PX_PER_MINUTE  // 780px
const HOUR_COUNT      = CALENDAR_END_HOUR - CALENDAR_START_HOUR

export default function WeekCalendar({ weekStart, data, isLoading, onSlotClick, onLessonClick }: Props) {
  const today = todayStr()

  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const hours = useMemo(() =>
    Array.from({ length: HOUR_COUNT + 1 }, (_, i) => CALENDAR_START_HOUR + i),
    []
  )

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div className="text-sm text-gray-400">Chargement…</div>
        </div>
      )}

      {/* Day headers */}
      <div className="grid border-b border-gray-200 bg-gray-50" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
        <div className="h-12" /> {/* time-gutter spacer */}
        {days.map((day) => {
          const { short, date } = formatDayHeader(day)
          const isToday = day === today
          return (
            <div
              key={day}
              className={`h-12 flex flex-col items-center justify-center border-l border-gray-200 ${
                isToday ? 'bg-indigo-50' : ''
              }`}
            >
              <span className={`text-[11px] font-medium uppercase tracking-wide ${isToday ? 'text-indigo-600' : 'text-gray-500'}`}>
                {short}
              </span>
              <span className={`text-sm font-bold ${isToday ? 'text-indigo-700' : 'text-gray-800'}`}>
                {date}
              </span>
            </div>
          )
        })}
      </div>

      {/* Grid body */}
      <div
        className="grid overflow-y-auto select-none"
        style={{
          gridTemplateColumns: '52px repeat(7, 1fr)',
          maxHeight: '65vh',
        }}
      >
        {/* Time gutter */}
        <div className="relative border-r border-gray-200" style={{ height: `${CALENDAR_HEIGHT}px` }}>
          {hours.map((h) => (
            <div
              key={h}
              className="absolute w-full flex items-start justify-end pr-2"
              style={{ top: `${(h - CALENDAR_START_HOUR) * 60 * PX_PER_MINUTE - 8}px` }}
            >
              {h < CALENDAR_END_HOUR && (
                <span className="text-[10px] text-gray-400 font-medium">
                  {String(h).padStart(2, '0')}h
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const lessons       = data[day] ?? []
          const positioned    = computeDayLayout(lessons)
          const isToday       = day === today

          return (
            <div
              key={day}
              className={`relative border-l border-gray-200 cursor-pointer ${isToday ? 'bg-indigo-50/30' : ''}`}
              style={{ height: `${CALENDAR_HEIGHT}px` }}
              onClick={(e) => {
                // Only trigger slot-click if clicking on the background (not a lesson block)
                if ((e.target as HTMLElement).closest('button[data-lesson]')) return
                const rect      = e.currentTarget.getBoundingClientRect()
                const scrollTop = (e.currentTarget.closest('[style*="max-height"]') as HTMLElement)?.scrollTop ?? 0
                const relY      = e.clientY - rect.top + scrollTop
                const minutes   = Math.floor(relY / PX_PER_MINUTE)
                const snapped   = Math.floor(minutes / 30) * 30
                const h         = Math.floor(snapped / 60) + CALENDAR_START_HOUR
                const m         = snapped % 60
                const time      = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
                onSlotClick(day, time)
              }}
            >
              {/* Hour separator lines */}
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute w-full border-t border-gray-100 pointer-events-none"
                  style={{ top: `${(h - CALENDAR_START_HOUR) * 60 * PX_PER_MINUTE}px` }}
                />
              ))}

              {/* Half-hour lines */}
              {hours.slice(0, -1).map((h) => (
                <div
                  key={`${h}-30`}
                  className="absolute w-full border-t border-gray-50 pointer-events-none"
                  style={{ top: `${((h - CALENDAR_START_HOUR) * 60 + 30) * PX_PER_MINUTE}px` }}
                />
              ))}

              {/* Lesson blocks */}
              {positioned.map((p) => (
                <LessonBlock
                  key={p.lesson.id}
                  positioned={p}
                  onClick={() => onLessonClick(p.lesson)}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
