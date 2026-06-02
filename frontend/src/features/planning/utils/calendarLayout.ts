import type { Lesson } from '../types'

export const CALENDAR_START_HOUR = 7   // 07:00
export const CALENDAR_END_HOUR   = 20  // 20:00
export const TOTAL_MINUTES       = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60
export const PX_PER_MINUTE       = 1   // 1px per minute → 780px total height

export interface PositionedLesson {
  lesson: Lesson
  top: number      // px from top of calendar
  height: number   // px
  colIndex: number // 0-based column within the group
  colCount: number // total columns in the group
}

/** Converts a datetime string ("2026-06-02 09:30:00") to minutes from CALENDAR_START_HOUR */
export function toCalendarMinutes(datetime: string): number {
  const d = new Date(datetime)
  return (d.getHours() - CALENDAR_START_HOUR) * 60 + d.getMinutes()
}

/**
 * Computes visual positions for lessons on a given day.
 * Overlapping lessons are placed in side-by-side columns (Google Calendar style).
 */
export function computeDayLayout(lessons: Lesson[]): PositionedLesson[] {
  if (lessons.length === 0) return []

  const sorted = [...lessons].sort((a, b) => a.starts_at.localeCompare(b.starts_at))

  // Build groups of overlapping lessons
  const groups: Lesson[][] = []
  let currentGroup: Lesson[] = []
  let groupEndMinutes = -1

  for (const lesson of sorted) {
    const startMin = toCalendarMinutes(lesson.starts_at)
    const endMin   = toCalendarMinutes(lesson.ends_at)

    if (startMin >= groupEndMinutes) {
      // Start a new group
      if (currentGroup.length > 0) groups.push(currentGroup)
      currentGroup = [lesson]
      groupEndMinutes = endMin
    } else {
      currentGroup.push(lesson)
      groupEndMinutes = Math.max(groupEndMinutes, endMin)
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup)

  const result: PositionedLesson[] = []

  for (const group of groups) {
    const colCount = group.length

    group.forEach((lesson, colIndex) => {
      const startMin = Math.max(0, toCalendarMinutes(lesson.starts_at))
      const endMin   = Math.min(TOTAL_MINUTES, toCalendarMinutes(lesson.ends_at))

      result.push({
        lesson,
        top:      startMin * PX_PER_MINUTE,
        height:   Math.max(20, (endMin - startMin) * PX_PER_MINUTE),
        colIndex,
        colCount,
      })
    })
  }

  return result
}

/** Formats a date as "Lun. 02/06" */
export function formatDayHeader(dateStr: string): { short: string; day: string; date: string } {
  const d = new Date(dateStr + 'T12:00:00')
  const days  = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.']
  const short = days[d.getDay()]
  const day   = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return { short, day, date: `${day}/${month}` }
}

/** Returns YYYY-MM-DD for a given offset from a base date */
export function addDays(baseDate: string, days: number): string {
  const d = new Date(baseDate + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Returns the Monday of the week containing the given date */
export function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const dow = d.getDay()                     // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow     // shift to Monday
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

/** Returns today as YYYY-MM-DD */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Formats a time from "2026-06-02 09:30:00" to "09:30" */
export function formatTime(datetime: string): string {
  return datetime.slice(11, 16)
}
