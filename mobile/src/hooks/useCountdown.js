import { useEffect, useState } from 'react';

/**
 * Ticks down to `targetIso`, correcting for drift between the device's clock and the
 * server's clock: we compute a fixed offset once (serverTime - deviceTime, both
 * captured on the same API response) and apply it every tick, rather than trusting the
 * device clock outright. This matters because the countdown's correctness (and, more
 * importantly, the actual registration deadline enforcement) is a business rule that
 * must ultimately be judged by the server, not a possibly-wrong device clock.
 */
export function useCountdown(targetIso, serverTimeIso) {
  const [msRemaining, setMsRemaining] = useState(() => compute(targetIso, serverTimeIso));

  useEffect(() => {
    setMsRemaining(compute(targetIso, serverTimeIso));
    const interval = setInterval(() => {
      setMsRemaining(compute(targetIso, serverTimeIso));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetIso, serverTimeIso]);

  return msRemaining;
}

function compute(targetIso, serverTimeIso) {
  if (!targetIso || !serverTimeIso) return 0;
  const offset = new Date(serverTimeIso).getTime() - Date.now();
  const estimatedServerNow = Date.now() + offset;
  return Math.max(new Date(targetIso).getTime() - estimatedServerNow, 0);
}

export function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
}
