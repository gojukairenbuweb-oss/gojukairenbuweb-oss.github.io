export const formatDate = (d: Date) =>
  d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

// In sviluppo (npm run dev) mostra anche le bozze; nel build di produzione no.
export const isPublished = (entry: { data: { draft?: boolean } }) =>
  import.meta.env.DEV || !entry.data.draft;

export const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.valueOf() - a.data.date.valueOf();
