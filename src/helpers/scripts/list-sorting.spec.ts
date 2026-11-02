import { activityEpoch, readSortPreference, saveSortPreference, sortOptions, sortRows } from './list-sorting';

describe('Project and expedition list sorting', () => {
  afterEach(() => localStorage.removeItem('geome.sort.v1.test'));
  const rows = [
    { projectId: 2, projectTitle: 'Project 10', user: { username: 'zebra' }, created: '2020-01-01T00:00:00Z', latestDataModification: '2024-01-01T00:00:00Z', entityStats: { SampleCount: 2 } },
    { projectId: 1, projectTitle: 'project 2', user: { username: 'Alice' }, created: '2023-01-01T00:00:00Z', latestDataModification: null, entityStats: { SampleCount: 10 } },
    { projectId: 3, projectTitle: 'Alpha', user: null, created: null, latestDataModification: '2025-01-01T00:00:00Z', entityStats: { SampleCount: 0 } }
  ];
  const titles = (field: string, direction: 'asc' | 'desc') => sortRows(rows, { field, direction }).map(row => row.projectTitle);
  it('sorts text naturally, ignoring case, without changing the input', () => {
    expect(titles('title', 'asc')).toEqual(['Alpha', 'project 2', 'Project 10']);
    expect(titles('title', 'desc')).toEqual(['Project 10', 'project 2', 'Alpha']);
    expect(rows[0].projectId).toBe(2);
  });
  it('sorts activity with nulls last in either direction', () => {
    expect(titles('latestDataModification', 'desc')).toEqual(['Alpha', 'Project 10', 'project 2']);
    expect(titles('latestDataModification', 'asc')).toEqual(['Project 10', 'Alpha', 'project 2']);
  });
  it('sorts creation dates with missing values last', () => {
    expect(titles('created', 'desc')).toEqual(['project 2', 'Project 10', 'Alpha']);
    expect(titles('created', 'asc')).toEqual(['Project 10', 'project 2', 'Alpha']);
  });
  it('sorts owners separately from last actors', () => {
    expect(titles('owner', 'asc')).toEqual(['project 2', 'Project 10', 'Alpha']);
    expect(titles('owner', 'desc')).toEqual(['Project 10', 'project 2', 'Alpha']);
  });
  it('offers three separate owner options', () => {
    expect(sortOptions(rows).filter(option => option.field.startsWith('owner')).map(option => option.label))
      .toEqual(['Owner Last Name', 'Owner First Name', 'Owner Username']);
  });
  it('independently sorts owner names and usernames for project and expedition response shapes', () => {
    const items = [
      { projectId: 1, projectTitle: 'A', user: { firstName: 'Zoe', lastName: 'Adams', username: 'b' } },
      { projectId: 2, projectTitle: 'B', user: { firstName: 'amy', lastName: 'Zimmer', username: 'c' } },
      { projectId: 3, projectTitle: 'C', ownerFirstName: 'Bea', ownerLastName: 'Miller', ownerUsername: 'a' },
      { projectId: 4, projectTitle: 'D', user: { firstName: ' ', lastName: '', username: '' } }
    ];
    const ids = (field: string, direction: 'asc' | 'desc') => sortRows(items, { field, direction }).map(item => item.projectId);
    expect(ids('ownerLastName', 'asc')).toEqual([1, 3, 2, 4]);
    expect(ids('ownerLastName', 'desc')).toEqual([2, 3, 1, 4]);
    expect(ids('ownerFirstName', 'asc')).toEqual([2, 3, 1, 4]);
    expect(ids('ownerFirstName', 'desc')).toEqual([1, 3, 2, 4]);
    expect(ids('ownerUsername', 'asc')).toEqual([3, 1, 2, 4]);
    expect(ids('ownerUsername', 'desc')).toEqual([2, 1, 3, 4]);
  });
  it('preserves old saved Owner sorting as Owner Username', () => {
    localStorage.setItem('geome.sort.v1.test', JSON.stringify({ field: 'owner', direction: 'desc' }));
    expect(readSortPreference('test')).toEqual({ field: 'ownerUsername', direction: 'desc' });
  });
  it('sorts numeric counts rather than strings or presence flags', () => {
    expect(titles('SampleCount', 'desc')).toEqual(['project 2', 'Project 10', 'Alpha']);
    expect(titles('SampleCount', 'asc')).toEqual(['Alpha', 'Project 10', 'project 2']);
  });
  it('reads expedition owner/count shapes and keeps missing counts last', () => {
    const items = [{ expeditionId: 2, expeditionTitle: 'B', ownerUsername: 'A', Sample_PhotoCount: '10' }, { expeditionId: 1, expeditionTitle: 'A', ownerUsername: 'B', Sample_PhotoCount: 2 }, { expeditionId: 3, expeditionTitle: 'C' }];
    expect(sortRows(items, { field: 'Sample_PhotoCount', direction: 'desc' }).map(row => row.expeditionId)).toEqual([2, 1, 3]);
    expect(sortOptions(items).find(option => option.field === 'Sample_PhotoCount')?.label).toBe('Sample photos');
  });
  it('breaks equal values deterministically by title and ID', () => {
    const items = [{ expeditionId: 3, expeditionTitle: 'Same', SampleCount: 1 }, { expeditionId: 1, expeditionTitle: 'Same', SampleCount: 1 }];
    expect(sortRows(items, { field: 'SampleCount', direction: 'desc' }).map(item => item.expeditionId)).toEqual([1, 3]);
  });
  it('falls back to alphabetical when statistics are unavailable', () => {
    const items = [{ expeditionTitle: 'B' }, { expeditionTitle: 'A' }];
    expect(sortRows(items, { field: 'SampleCount', direction: 'desc' })[0].expeditionTitle).toBe('A');
  });
  it('stores and validates browser preferences', () => {
    saveSortPreference('test', { field: 'ownerUsername', direction: 'asc' });
    expect(readSortPreference('test')).toEqual({ field: 'ownerUsername', direction: 'asc' });
    localStorage.setItem('geome.sort.v1.test', '{broken');
    expect(readSortPreference('test')).toEqual({ field: 'latestDataModification', direction: 'desc' });
  });
  it('interprets old zone-free timestamps as UTC and rejects invalid values', () => {
    expect(activityEpoch('2024-01-02 03:04:05.123')).toBe(Date.parse('2024-01-02T03:04:05.123Z'));
    expect(activityEpoch('not a date')).toBeNull();
    expect(activityEpoch(null)).toBeNull();
    expect(activityEpoch('2024-11-03T01:30:00-07:00')).not.toBe(activityEpoch('2024-11-03T01:30:00-08:00'));
  });
});
