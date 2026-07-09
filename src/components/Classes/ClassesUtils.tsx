import { format } from 'date-fns';
import { LiveClass } from './ClassesTypes';

export function normalizeLiveClass(raw: Record<string, unknown>, courses: any[] = []): LiveClass {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 0,
      course_id: 0,
      title: 'Untitled Class',
      scheduled_at: '',
      duration: 0,
      join_link: '',
    };
  }
  let course_id = NaN;

  const courseRaw = raw.course_id ?? raw.courseId ?? raw.course_id_id;
  if (courseRaw !== undefined && courseRaw !== null && courseRaw !== '') {
    course_id = Number(courseRaw);
  }

  if (isNaN(course_id) && raw.course && typeof raw.course === 'object') {
    const nestedId = (raw.course as any).id ?? (raw.course as any).course_id ?? (raw.course as any).courseId;
    if (nestedId !== undefined && nestedId !== null && nestedId !== '') {
      course_id = Number(nestedId);
    }
  }

  if (isNaN(course_id)) {
    const possibleStr = String(raw.course ?? raw.course_title ?? raw.course_name ?? raw.course_code ?? '').trim();
    if (possibleStr) {
      const parsedNum = Number(possibleStr);
      if (!isNaN(parsedNum)) {
        course_id = parsedNum;
      } else {
        const matched = Array.isArray(courses) ? courses.find(
          c => {
            if (!c) return false;
            const cTitle = String(c.title || c.name || '').toLowerCase();
            const cCode = String(c.code || '').toLowerCase();
            const search = possibleStr.toLowerCase();
            return cTitle === search || cCode === search || cTitle.includes(search) || search.includes(cTitle);
          }
        ) : undefined;
        if (matched) {
          course_id = Number(matched.id);
        }
      }
    }
  }

  return {
    id: Number(raw.id),
    course_id: Number.isFinite(course_id) ? course_id : 0,
    title: String(raw.title ?? ''),
    scheduled_at: String(
      raw.date ??
      raw.scheduled_at ??
      raw.scheduledAt ??
      raw.schedule_at ??
      raw.start_time ??
      raw.startTime ??
      raw.start ??
      ''
    ),
    duration: Number(raw.duration ?? 0),
    join_link: String(raw.join_link ?? raw.joinLink ?? ''),
    recorded_link: (() => {
      const rec = raw.recorded_link ?? raw.recordedLink;
      if (rec == null || rec === '') return undefined;
      return String(rec);
    })(),
  };
}

export const parseScheduledDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  let cleanStr = dateStr.trim();
  if (cleanStr.includes(' ')) {
    cleanStr = cleanStr.replace(' ', 'T');
  }
  if (!cleanStr.endsWith('Z') && !/\+\d{2}:?\d{2}$/.test(cleanStr) && !/-\d{2}:?\d{2}$/.test(cleanStr)) {
    cleanStr = cleanStr + 'Z';
  }
  const d = new Date(cleanStr);
  return isNaN(d.getTime()) ? new Date(dateStr) : d;
};

export const formatSafeDate = (dateStr?: string) => {
  if (!dateStr || dateStr.trim() === '' || dateStr === 'undefined' || dateStr === 'null') return 'Not scheduled';
  try {
    const d = parseScheduledDate(dateStr);
    if (isNaN(d.getTime())) return 'Invalid date';
    return format(d, 'dd MMM yyyy • hh:mm a');
  } catch {
    return 'Invalid date';
  }
};

export const getClassStatus = (scheduledAt: string) => {
  const now = new Date();
  const scheduled = parseScheduledDate(scheduledAt);
  return scheduled > now ? 'Active' : 'Completed';
};
