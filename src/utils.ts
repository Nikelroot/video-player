import { useMemo, useSyncExternalStore } from 'react';

export const formatTime = (seconds: number) => {
  const totalSeconds = Number.parseInt(String(seconds), 10);
  const safeSeconds = Number.isFinite(totalSeconds) ? totalSeconds : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
};

type WindowWidthTuple = [width: number, isMobile: boolean, mobileType: string];

let widthSnapshot = 0;
let resizeRafId: number | null = null;
let isListening = false;
const listeners = new Set<() => void>();

const notifyAll = () => {
  listeners.forEach((listener) => listener());
};

const resizeHandler = () => {
  if (typeof window === 'undefined') return;
  const nextWidth = window.innerWidth;
  if (resizeRafId != null) cancelAnimationFrame(resizeRafId);
  resizeRafId = requestAnimationFrame(() => {
    if (widthSnapshot === nextWidth) return;
    widthSnapshot = nextWidth;
    notifyAll();
  });
};

const startListening = () => {
  if (typeof window === 'undefined' || isListening) return;
  isListening = true;
  widthSnapshot = window.innerWidth;
  window.addEventListener('resize', resizeHandler, { passive: true });
};

const stopListening = () => {
  if (typeof window === 'undefined' || !isListening || listeners.size > 0) return;
  window.removeEventListener('resize', resizeHandler as EventListener);
  if (resizeRafId != null) {
    cancelAnimationFrame(resizeRafId);
    resizeRafId = null;
  }
  isListening = false;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  startListening();

  return () => {
    listeners.delete(listener);
    stopListening();
  };
};

const getSnapshot = () => {
  if (typeof window !== 'undefined' && !isListening) {
    widthSnapshot = window.innerWidth;
  }
  return widthSnapshot;
};

const getServerSnapshot = () => 0;

export function useWindowWidth(mobileLimit = 768): WindowWidthTuple {
  const width = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isMobile = width <= mobileLimit;
  const mobileType = useMemo(() => {
    if (width <= mobileLimit) return 'mobile';
    if (width <= 1024) return 'laptop';
    return 'default';
  }, [width, mobileLimit]);

  return [width, isMobile, mobileType];
}

type ThrottledNumberFn = ((value: number) => void) & { cancel: () => void };

export const createThrottledNumberFn = (fn: (value: number) => void, waitMs: number): ThrottledNumberFn => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastCall = 0;
  let pendingValue: number | null = null;

  const throttled = ((value: number) => {
    const now = Date.now();
    const elapsed = now - lastCall;

    if (elapsed >= waitMs) {
      lastCall = now;
      fn(value);
      return;
    }

    pendingValue = value;
    if (timer) return;

    timer = setTimeout(() => {
      timer = null;
      lastCall = Date.now();
      if (pendingValue != null) {
        fn(pendingValue);
        pendingValue = null;
      }
    }, waitMs - elapsed);
  }) as ThrottledNumberFn;

  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    pendingValue = null;
  };

  return throttled;
};
