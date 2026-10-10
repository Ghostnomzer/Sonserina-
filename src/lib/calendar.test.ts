import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createInitialState } from '../data/portal';
import {
  addDays,
  dateFromKey,
  isValidDateKey,
  localDateKey,
  monthCells,
  sortByDeadline,
  upcomingActivities,
} from './calendar';

test('calendar aligns leap-year February with Sunday-first weeks', () => {
  const cells = monthCells(dateFromKey('2024-02-14'));
  assert.deepEqual(cells.slice(0, 4), [null, null, null, null]);
  assert.equal(cells[4], '2024-02-01');
  assert.equal(cells.filter(Boolean).length, 29);
  assert.equal(cells.length % 7, 0);
  assert.equal(cells.at(-3), '2024-02-29');
});

test('calendar handles a six-week month and a month beginning Sunday', () => {
  assert.equal(monthCells(dateFromKey('2025-03-01')).length, 42);
  assert.equal(monthCells(dateFromKey('2025-06-01'))[0], '2025-06-01');
});

test('impossible or malformed calendar dates are rejected', () => {
  for (const invalid of [
    '2025-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-00-01',
    '2026-01-00',
    '10/10/2026',
    '',
    null,
  ]) {
    assert.equal(isValidDateKey(invalid), false, String(invalid));
  }
  assert.equal(isValidDateKey('2024-02-29'), true);
});

test('local calendar dates preserve their day in eastern and western time zones', () => {
  const original = process.env.TZ;
  try {
    for (const zone of ['America/Sao_Paulo', 'Pacific/Kiritimati', 'America/Los_Angeles']) {
      process.env.TZ = zone;
      assert.equal(localDateKey(dateFromKey('2026-10-10')), '2026-10-10');
      assert.equal(localDateKey(addDays(dateFromKey('2026-12-31'), 1)), '2027-01-01');
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test('upcoming deadlines include today and day seven, excluding overdue and completed tasks', () => {
  const state = createInitialState(dateFromKey('2026-10-10'));
  const base = state.activities[0];
  const activities = [
    { ...base, id: 'overdue', dueDate: '2026-10-09' },
    { ...base, id: 'today', dueDate: '2026-10-10' },
    { ...base, id: 'edge', dueDate: '2026-10-17' },
    { ...base, id: 'later', dueDate: '2026-10-18' },
    { ...base, id: 'done', dueDate: '2026-10-11', status: 'completed' as const },
  ];
  assert.deepEqual(
    upcomingActivities(activities, dateFromKey('2026-10-10')).map((activity) => activity.id),
    ['today', 'edge'],
  );
  assert.equal(upcomingActivities(state.activities, dateFromKey('2026-10-10')).length, 3);
});

test('deadline sorting does not mutate stored activities', () => {
  const activities = createInitialState().activities.reverse();
  const order = activities.map((activity) => activity.id);
  const sorted = sortByDeadline(activities);
  assert.deepEqual(
    activities.map((activity) => activity.id),
    order,
  );
  assert.notEqual(sorted[0].id, activities[0].id);
});
