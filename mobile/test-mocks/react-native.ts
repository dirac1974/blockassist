// Minimal react-native mock for vitest. Only what our pure-logic tests touch.

export const Platform = {
  OS: 'ios' as 'ios' | 'android' | 'web',
  select: <T>(spec: { ios?: T; android?: T; default?: T }): T | undefined =>
    spec.ios ?? spec.android ?? spec.default,
};

export class StyleSheet {
  static create<T extends Record<string, object>>(s: T): T {
    return s;
  }
  static flatten(s: unknown): unknown {
    return s;
  }
}

export const NativeModules: Record<string, unknown> = {};
export const Alert = { alert: (..._args: unknown[]) => undefined };
