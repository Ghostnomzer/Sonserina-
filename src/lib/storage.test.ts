import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createInitialState } from '../data/portal';
import { isPortalState, loadPortalState, savePortalState } from './storage';

test('the initial state survives JSON serialization, including an empty activity list', () => {
  const initial = createInitialState();
  assert.equal(isPortalState(JSON.parse(JSON.stringify(initial))), true);
  assert.equal(isPortalState({ ...initial, activities: [] }), true);
});

test('invalid persisted data cannot break rendering or dates', () => {
  const state = createInitialState();
  const activity = state.activities[0];
  const invalid = [
    null,
    [],
    {},
    { ...state, version: 2 },
    { ...state, profile: null },
    { ...state, readNotices: [null] },
    ...[
      { ...activity, dueDate: '2025-02-30' },
      { ...activity, title: '   ' },
      { ...activity, subjectId: 'unknown' },
      { ...activity, status: 'unknown' },
      { ...activity, id: '' },
    ].map((item) => ({ ...state, activities: [item] })),
    { ...state, activities: [activity, activity] },
  ];
  for (const value of invalid) assert.equal(isPortalState(value), false);
});

test('loading broken JSON or inaccessible storage falls back without crashing', () => {
  const fallback = createInitialState();
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: { getItem: () => '{broken' },
    });
    assert.equal(loadPortalState(fallback), fallback);
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('quota');
        },
      },
    });
    assert.equal(loadPortalState(fallback), fallback);
    assert.equal(savePortalState(fallback), false);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('saved profiles and completed activities are restored', () => {
  const state = createInitialState();
  state.profile.name = 'Ghost';
  state.activities[0].status = 'completed';
  let raw = '';
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => raw,
        setItem: (_key: string, value: string) => {
          raw = value;
        },
      },
    });
    assert.equal(savePortalState(state), true);
    const restored = loadPortalState(createInitialState());
    assert.equal(restored.profile.name, 'Ghost');
    assert.equal(restored.activities[0].status, 'completed');
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
