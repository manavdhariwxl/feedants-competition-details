import { getDeviceId } from '../utils/deviceUser';

// Metro inlines EXPO_PUBLIC_* env vars at build time — no extra package needed.
// Set EXPO_PUBLIC_API_URL in mobile/.env (see .env.example). Falls back to the
// standard "host machine" address for the platform's emulator/simulator/dev client.
const DEFAULT_API_URL = 'http://localhost:4000';
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

export class ApiRequestError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const deviceId = await getDeviceId();

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiRequestError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection and the API URL.');
  }

  let json = null;
  try {
    json = await response.json();
  } catch (parseErr) {
    throw new ApiRequestError(response.status, 'BAD_RESPONSE', 'The server returned an unexpected response.');
  }

  if (!response.ok || !json.success) {
    const err = json && json.error ? json.error : {};
    throw new ApiRequestError(response.status, err.code || 'UNKNOWN_ERROR', err.message || 'Something went wrong.');
  }

  return json.data;
}

export const api = {
  listCompetitions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/competitions${query ? `?${query}` : ''}`);
  },
  getCompetition: (id) => request(`/api/competitions/${id}`),
  register: (id) => request(`/api/competitions/${id}/register`, { method: 'POST' }),
};
