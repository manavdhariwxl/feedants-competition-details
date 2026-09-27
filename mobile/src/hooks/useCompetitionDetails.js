import { useCallback, useEffect, useState } from 'react';
import { api, ApiRequestError } from '../api/client';

/**
 * Loads the competition to display and exposes a `register` action.
 *
 * The screen is never given a hardcoded competition id: it first asks the backend for
 * the most recently created competition (GET /api/competitions), then loads that
 * competition's full details. This keeps the app "just works" after `npm run seed`
 * with zero manual configuration, while the actual id genuinely comes from the API,
 * not from a constant baked into the client.
 */
export function useCompetitionDetails() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error' | 'empty'
  const [competition, setCompetition] = useState(null);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const list = await api.listCompetitions({ limit: 1 });
      if (!list || list.length === 0) {
        setStatus('empty');
        return;
      }
      const details = await api.getCompetition(list[0].id);
      setCompetition(details);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err : new ApiRequestError(0, 'UNKNOWN_ERROR', 'Failed to load.'));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const register = useCallback(async () => {
    if (!competition) return;
    setRegistering(true);
    setRegisterError(null);
    try {
      const result = await api.register(competition.id);
      setCompetition(result.competition);
    } catch (err) {
      setRegisterError(err instanceof ApiRequestError ? err : new ApiRequestError(0, 'UNKNOWN_ERROR', 'Registration failed.'));
    } finally {
      setRegistering(false);
    }
  }, [competition]);

  return { status, competition, error, reload: load, register, registering, registerError };
}
