/**
 * Atelier frame prefetcher.
 *
 * The sartoria page's hero is a 193-frame scroll-scrubbed sequence totaling
 * ~30MB. Waiting to load those on first navigation to sartoria would delay
 * the cinematic effect. Instead, we start downloading them in the
 * background while the user is on the immagine page -- they have the
 * bandwidth budget and 30+ seconds of reading time.
 *
 * Runs only once per session (localStorage sentinel). Uses
 * requestIdleCallback + a delay so we don't compete with critical-path
 * assets on the immagine page.
 */

const FRAME_COUNT = 193;
const SENTINEL_KEY = 'atelier-prefetched';

export function prefetchAtelierFrames(base: string): void {
  if (typeof window === 'undefined') return;
  // Only prefetch once per session.
  try {
    if (sessionStorage.getItem(SENTINEL_KEY) === '1') return;
  } catch (_) {}

  const fire = () => {
    try {
      sessionStorage.setItem(SENTINEL_KEY, '1');
    } catch (_) {}
    // Stream the downloads in batches so we don't saturate the connection
    // all at once. Batch of 6 in flight at a time is a reasonable default
    // that keeps bandwidth moving without blocking other fetches.
    let next = 1;
    const inFlight: Set<Promise<unknown>> = new Set();
    const BATCH = 6;

    function schedule() {
      while (inFlight.size < BATCH && next <= FRAME_COUNT) {
        const idx = next++;
        const url = `${base}scenes/atelier-frames/${String(idx).padStart(4, '0')}.jpg`;
        // Use a link preload to let the browser prioritize according to its
        // own heuristics. Fallback is new Image() which also caches.
        const p = fetch(url, { priority: 'low' as any, cache: 'force-cache' })
          .catch(() => {})
          .finally(() => {
            inFlight.delete(p);
            schedule();
          });
        inFlight.add(p);
      }
    }
    schedule();
  };

  // Kick off during idle time so we don't block first paint / critical
  // assets. Timeout: 8s max wait for idle, then just go.
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(fire, { timeout: 8000 });
  } else {
    setTimeout(fire, 2500);
  }
}
