// expo-location mock — pure-function tests inject their own state.

export const Accuracy = {
  Lowest: 1,
  Low: 2,
  Balanced: 3,
  High: 4,
  Highest: 5,
  BestForNavigation: 6,
};

export type PermissionResponse = {
  status: 'granted' | 'denied' | 'undetermined';
  granted: boolean;
  canAskAgain: boolean;
  expires: 'never';
};

let mockPermission: PermissionResponse = {
  status: 'undetermined',
  granted: false,
  canAskAgain: true,
  expires: 'never',
};
let mockPosition = {
  coords: { latitude: 36.1147, longitude: -115.1728, accuracy: 10, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
  timestamp: 0,
};

export const __setMockPermission = (p: Partial<PermissionResponse>): void => {
  mockPermission = { ...mockPermission, ...p } as PermissionResponse;
};
export const __setMockPosition = (lat: number, lng: number): void => {
  mockPosition = { ...mockPosition, coords: { ...mockPosition.coords, latitude: lat, longitude: lng } };
};

export const requestForegroundPermissionsAsync = async (): Promise<PermissionResponse> => mockPermission;
export const getForegroundPermissionsAsync = async (): Promise<PermissionResponse> => mockPermission;
export const getCurrentPositionAsync = async (_opts?: unknown): Promise<typeof mockPosition> => mockPosition;
export const watchPositionAsync = async (
  _opts: unknown,
  callback: (pos: typeof mockPosition) => void,
): Promise<{ remove: () => void }> => {
  callback(mockPosition);
  return { remove: () => undefined };
};
