// LV-003 stub.
//
// Real Supabase wiring is deferred until backend credentials + schema land.
// This stub exposes the surface the call sites already use (a chainable
// query builder) and always returns "no data" so callers safely fall back
// to mock data (e.g. fetchUpcomingEvents() → MOCK_LAS_VEGAS_EVENTS).
//
// When the real client lands, swap to:
//
//   import { createClient } from '@supabase/supabase-js';
//   export const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, ...);
//
// Until then, this file ensures the mobile app compiles and runs offline.

type Result<T = unknown> = Promise<{ data: T | null; error: { message: string } | null }>;

interface QueryBuilder<T = unknown> {
  select: (cols?: string) => QueryBuilder<T>;
  gte: (col: string, value: unknown) => QueryBuilder<T>;
  lte: (col: string, value: unknown) => QueryBuilder<T>;
  eq: (col: string, value: unknown) => QueryBuilder<T>;
  order: (col: string, opts?: { ascending: boolean }) => QueryBuilder<T>;
  limit: (n: number) => QueryBuilder<T>;
  insert: (row: unknown) => Result<T>;
  upsert: (row: unknown) => Result<T>;
  delete: () => Result<T>;
  then: <U>(onFulfilled: (r: { data: T[] | null; error: { message: string } | null }) => U) => Promise<U>;
}

function makeBuilder<T>(): QueryBuilder<T> {
  const noData: { data: T[] | null; error: { message: string } | null } = { data: null, error: null };
  const builder: QueryBuilder<T> = {
    select: () => builder,
    gte: () => builder,
    lte: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    insert: async () => ({ data: null, error: null }),
    upsert: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    then: (onFulfilled) => Promise.resolve(noData).then(onFulfilled),
  };
  return builder;
}

export const supabase = {
  from<T = unknown>(_table: string): QueryBuilder<T> {
    return makeBuilder<T>();
  },
};
