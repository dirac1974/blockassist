// expo-task-manager mock — records definitions + lets tests fire them.

const definitions = new Map<string, (data?: unknown) => Promise<void> | void>();

export const defineTask = (name: string, executor: (data?: unknown) => Promise<void> | void): void => {
  definitions.set(name, executor);
};
export const isTaskDefined = (name: string): boolean => definitions.has(name);
export const getRegisteredTasksAsync = async (): Promise<Array<{ taskName: string; taskType: 'background' }>> =>
  Array.from(definitions.keys()).map((taskName) => ({ taskName, taskType: 'background' as const }));
export const unregisterTaskAsync = async (name: string): Promise<void> => {
  definitions.delete(name);
};

export const __fire = async (name: string, data?: unknown): Promise<void> => {
  const fn = definitions.get(name);
  if (fn) await fn(data);
};
export const __reset = (): void => {
  definitions.clear();
};
