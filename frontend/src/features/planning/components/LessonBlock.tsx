import type { PositionedLesson } from '../utils/calendarLayout'
import { formatTime } from '../utils/calendarLayout'
import { LESSON_TYPE_COLORS, LESSON_TYPE_LABELS } from '../types'

interface Props {
  positioned: PositionedLesson
  onClick: () => void
}

export default function LessonBlock({ positioned, onClick }: Props) {
  const { lesson, top, height, colIndex, colCount } = positioned
  const colors = LESSON_TYPE_COLORS[lesson.type]
  const isCancelled = lesson.status === 'cancelled'
  const isNoShow    = lesson.status === 'no_show'
  const isCompleted = lesson.status === 'completed'

  const widthPct  = 100 / colCount
  const leftPct   = colIndex * widthPct
  const compact   = height < 36

  return (
    <button
      onClick={onClick}
      style={{
        top:    `${top}px`,
        height: `${height}px`,
        left:   `calc(${leftPct}% + 2px)`,
        width:  `calc(${widthPct}% - 4px)`,
      }}
      className={[
        'absolute overflow-hidden rounded-md border-l-2 px-1.5 py-0.5 text-left transition-shadow',
        'hover:shadow-md hover:z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500',
        colors.bg,
        colors.border,
        colors.text,
        isCancelled || isNoShow ? 'opacity-50' : '',
      ].join(' ')}
    >
      {/* Status indicator dot */}
      {!compact && (
        <div className="flex items-center gap-1 mb-0.5">
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${colors.dot}`} />
          <span className="text-[10px] font-semibold uppercase tracking-wide truncate opacity-70">
            {LESSON_TYPE_LABELS[lesson.type]}
          </span>
        </div>
      )}

      <p className={`font-semibold truncate leading-tight ${compact ? 'text-[10px]' : 'text-xs'} ${isCancelled ? 'line-through' : ''}`}>
        {lesson.student.full_name}
      </p>

      {!compact && (
        <p className="text-[10px] truncate opacity-75">
          {formatTime(lesson.starts_at)} – {formatTime(lesson.ends_at)}
        </p>
      )}

      {!compact && lesson.instructor && (
        <p className="text-[10px] truncate opacity-60">{lesson.instructor.full_name}</p>
      )}

      {/* Status overlays */}
      {(isCancelled || isNoShow || isCompleted) && !compact && (
        <span className={`absolute top-0.5 right-0.5 text-[9px] font-bold px-1 rounded ${
          isCancelled ? 'bg-gray-200 text-gray-600' :
          isNoShow    ? 'bg-orange-200 text-orange-700' :
                        'bg-green-200 text-green-700'
        }`}>
          {isCancelled ? 'ANN.' : isNoShow ? 'ABS.' : 'OK'}
        </span>
      )}
    </button>
  )
}
