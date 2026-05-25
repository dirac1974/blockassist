// expo-secure-store mock — in-memory key/value store for tests.

const store = new Map<string, string>();

export const setItemAsync = async (key: string, value: string): Promise<void> => {
  store.set(key, value);
};
export const getItemAsync = async (key: string): Promise<string | null> => {
  return store.get(key) ?? null;
};
export const deleteItemAsync = async (key: string): Promise<void> => {
  store.delete(key);
};
export const isAvailableAsync = async (): Promise<boolean> => true;

export const __reset = (): void => {
  store.clear();
};
