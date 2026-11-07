export const formatDate = (d: Date) =>
  d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

// In sviluppo (npm run dev) mostra anche le bozze; nel build di produzione no.
export const isPublished = (entry: { data: { draft?: boolean } }) =>
  import.meta.env.DEV || !entry.data.draft;

export const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.valueOf() - a.data.date.valueOf();

// "13 dicembre 2026" oppure, per eventi su più giorni, "13–15 dicembre 2026" / "30 dicembre 2026 – 2 gennaio 2027"
export function formatRange(start: Date, end?: Date) {
  if (!end || end.valueOf() === start.valueOf()) return formatDate(start);
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  if (sameMonth) return `${start.getDate()}–${formatDate(end)}`;
  if (sameYear) return `${start.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} – ${formatDate(end)}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

// Un evento è "in programma" finché non è passata la sua data di fine (o di inizio)
export const eventoFuturo = (e: { data: { date: Date; data_fine?: Date } }, oggi = new Date(new Date().toDateString())) =>
  (e.data.data_fine ?? e.data.date) >= oggi;
