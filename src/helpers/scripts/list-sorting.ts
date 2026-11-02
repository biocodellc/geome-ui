export type SortDirection = 'asc' | 'desc';
export interface SortPreference { field: string; direction: SortDirection; }
export interface SortOption { field: string; label: string; disabled?: boolean; }
export const DEFAULT_SORT: SortPreference = { field: 'latestDataModification', direction: 'desc' };
const textOrder = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const ownerFields: Record<string, string> = { ownerLastName: 'lastName', ownerFirstName: 'firstName', ownerUsername: 'username' };
const canonicalField = (field: string): string => field === 'owner' ? 'ownerUsername' : field;
const labels: Record<string, string> = {
  SampleCount: 'Samples', EventCount: 'Events', TissueCount: 'Tissues',
  Sample_PhotoCount: 'Sample photos', Event_PhotoCount: 'Event photos',
  fastaSequenceCount: 'FASTA sequences', fastqMetadataCount: 'FASTQ metadata'
};

export function activityEpoch(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  let normalized = value;
  if (typeof value === 'string') {
    normalized = value.trim().replace(' ', 'T');
    if (/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d+)?)?$/.test(normalized as string)) normalized += 'Z';
  }
  const result = normalized instanceof Date ? normalized.getTime() : new Date(normalized as string | number).getTime();
  return Number.isFinite(result) ? result : null;
}

export function readSortPreference(key: string): SortPreference {
  try {
    const saved = JSON.parse(localStorage.getItem(`geome.sort.v1.${key}`) || 'null');
    if (saved && typeof saved.field === 'string' && (saved.direction === 'asc' || saved.direction === 'desc')) return { ...saved, field: canonicalField(saved.field) };
  } catch { /* Storage may be unavailable. */ }
  return { ...DEFAULT_SORT };
}

export function saveSortPreference(key: string, preference: SortPreference): void {
  try { localStorage.setItem(`geome.sort.v1.${key}`, JSON.stringify(preference)); } catch { /* Sorting still works without storage. */ }
}

export function sortOptions(items: readonly any[]): SortOption[] {
  const counts = new Set<string>();
  items.forEach(item => {
    [item, item.entityStats].forEach(values => Object.keys(values || {}).filter(key => key.endsWith('Count')).forEach(key => counts.add(key)));
  });
  return [
    { field: 'title', label: 'Alphabetical' },
    { field: 'latestDataModification', label: 'Latest activity', disabled: !items.some(item => 'latestDataModification' in item) },
    { field: 'created', label: 'Date created', disabled: !items.some(item => 'created' in item) },
    { field: 'ownerLastName', label: 'Owner Last Name' },
    { field: 'ownerFirstName', label: 'Owner First Name' },
    { field: 'ownerUsername', label: 'Owner Username' },
    ...[...counts].sort((a, b) => textOrder.compare(labels[a] || a, labels[b] || b)).map(field => ({ field, label: labels[field] || field.replace(/Count$/, '').replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2') }))
  ];
}

function valueFor(item: any, field: string): string | number | null {
  if (field === 'title') return item.projectTitle || item.expeditionTitle || item.expeditionCode || null;
  if (ownerFields[field]) {
    const value = item.user?.[ownerFields[field]] || item[field];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }
  if (field === 'created' || field === 'latestDataModification') return activityEpoch(item[field]);
  const value = item.entityStats?.[field] ?? item[field];
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function sortRows<T>(items: readonly T[], preference: SortPreference): T[] {
  const selected = sortOptions(items).find(option => option.field === canonicalField(preference.field) && !option.disabled);
  const field = selected?.field || 'title';
  const direction = selected ? preference.direction : 'asc';
  return [...items].sort((a: any, b: any) => {
    const first = valueFor(a, field), second = valueFor(b, field);
    if (first === null && second !== null) return 1;
    if (second === null && first !== null) return -1;
    let order = 0;
    if (first !== null && second !== null) order = typeof first === 'number' && typeof second === 'number' ? first - second : textOrder.compare(String(first), String(second));
    if (order) return direction === 'asc' ? order : -order;
    return textOrder.compare(String(valueFor(a, 'title') || ''), String(valueFor(b, 'title') || '')) ||
      textOrder.compare(String(a.projectId ?? a.expeditionId ?? a.expeditionCode ?? ''), String(b.projectId ?? b.expeditionId ?? b.expeditionCode ?? ''));
  });
}
