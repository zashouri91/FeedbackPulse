import { format, formatDistance, formatRelative } from 'date-fns';

export function formatDate(date: string | Date) {
  return format(new Date(date), 'PPP');
}

export function formatTime(date: string | Date) {
  return format(new Date(date), 'p');
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'PPp');
}

export function formatRelativeTime(date: string | Date) {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function formatRelativeDate(date: string | Date) {
  return formatRelative(new Date(date), new Date());
}