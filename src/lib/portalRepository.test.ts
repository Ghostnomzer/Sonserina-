import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createInitialState } from '../data/portal';
import { readAllRows, toActivity, toSubject } from './portalRepository';

test('a fresh account starts without demo content or profile values', () => {
  const state = createInitialState();
  assert.equal(
    state.activities.length +
      state.subjects.length +
      state.notices.length +
      state.readNotices.length,
    0,
  );
  assert.deepEqual(state.profile, { name: '', year: '', goal: '' });
  state.profile.name = 'Changed';
  assert.equal(createInitialState().profile.name, '');
});

test('the portal reads beyond the Data API row limit without truncating counts or swallowing page failures', async () => {
  const rows = Array.from({ length: 1203 }, (_, id) => ({ id }));
  const requested: number[] = [];
  const result = await readAllRows(async (from, to) => {
    requested.push(from);
    return { data: rows.slice(from, to + 1) };
  });
  assert.equal(result.length, 1203);
  assert.deepEqual(requested, [0, 500, 1000]);
  await assert.rejects(
    readAllRows(async (from) =>
      from === 0
        ? { data: rows.slice(0, 500) }
        : { data: null, error: new Error('Connection failed') },
    ),
    /Connection failed/,
  );
});

test('shared activities get only the current member completion state and preserve a date-only deadline', () => {
  const row = {
    id: 'assignment',
    subject_id: 'subject',
    title: 'Entrega',
    description: '',
    due_date: '2026-10-10',
    created_at: '2026-10-10T23:55:00Z',
  };
  assert.equal(toActivity(row, new Set(['assignment'])).status, 'completed');
  assert.equal(toActivity(row, new Set(['other-assignment'])).status, 'open');
  assert.equal(toActivity(row, new Set()).dueDate, '2026-10-10');
  assert.equal(
    toSubject({
      id: 'subject',
      name: 'Disciplina',
      icon: 'flask',
      description: '',
      professor: '',
      created_at: '',
    }).icon,
    'flask',
  );
});
