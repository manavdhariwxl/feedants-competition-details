import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'feedants.deviceId';

function generateId() {
  // Good enough uniqueness for a demo device identifier — not used for anything
  // security-sensitive. A real app would replace this whole mechanism with proper
  // authentication (see README).
  const random = Math.random().toString(36).slice(2);
  const timestamp = Date.now().toString(36);
  return `device-${timestamp}-${random}`;
}

let cachedDeviceId = null;

/** Returns a stable device id for this installation, creating and persisting one on first call. */
export async function getDeviceId() {
  if (cachedDeviceId) return cachedDeviceId;

  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored) {
    cachedDeviceId = stored;
    return stored;
  }

  const id = generateId();
  await AsyncStorage.setItem(STORAGE_KEY, id);
  cachedDeviceId = id;
  return id;
}
