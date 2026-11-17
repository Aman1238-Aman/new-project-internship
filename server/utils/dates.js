export const dateOnly = (value) => {
  if (!value) return null;
  const raw = typeof value === 'string' ? value.slice(0, 10) : new Date(value).toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === raw ? date : null;
};
export const dateString = (value) => value ? new Date(value).toISOString().slice(0, 10) : null;
export function todayString(timeZone = process.env.APP_TIMEZONE || 'UTC', now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (type) => parts.find((x) => x.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function isOverdue(task, now = new Date()) {
  return !['Completed', 'Cancelled'].includes(task.status) && dateString(task.dueDate) < todayString(undefined, now);
}
