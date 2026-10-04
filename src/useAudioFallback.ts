import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioRange } from './VideoPlayer';

export function useAudioFallback(options: {
  primary: string;
  fallback?: string;
  ranges?: readonly AudioRange[];
  video: React.RefObject<HTMLVideoElement | null>;
  playingIntent: React.RefObject<boolean>;
  onChange?: (videoOnly: boolean) => void;
  onStall?: () => void;
}) {
  const latest = useRef(options);
  latest.current = options;
  const [videoOnly, setVideoOnly] = useState(Boolean(options.fallback));
  const mode = useRef(Boolean(options.fallback));
  const progress = useRef({ time: 0, at: Date.now(), failed: false });
  const cooldown = useRef(0);
  const audioErrors = useRef(0);
  const audioErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshot = useRef<{ time: number; playing: boolean; rate: number; volume: number; muted: boolean } | null>(null);

  const switchSource = useCallback((next: boolean, failure = false) => {
    const { video, fallback, onChange } = latest.current;
    const element = video.current;
    if (!fallback || !element || mode.current === next) return false;
    snapshot.current = {
      time: Number.isFinite(element.currentTime) ? element.currentTime : 0,
      playing: latest.current.playingIntent.current,
      rate: element.playbackRate, volume: element.volume, muted: element.muted
    };
    mode.current = next;
    progress.current = { time: element.currentTime, at: Date.now(), failed: false };
    audioErrors.current = 0;
    if (audioErrorTimer.current) clearTimeout(audioErrorTimer.current);
    audioErrorTimer.current = null;
    if (failure) cooldown.current = Date.now() + 15000;
    setVideoOnly(next);
    onChange?.(next);
    return true;
  }, []);

  const onAudioError = useCallback((data?: { fatal?: boolean; details?: string; frag?: { type?: string }; parent?: string; context?: { type?: string } }) => {
    if (!latest.current.fallback || mode.current) return false;
    const isAudio = data?.frag?.type === 'audio' || data?.parent === 'audio' || data?.context?.type === 'audioTrack' || /^audioTrack/.test(data?.details || '');
    if (!isAudio) return false;
    audioErrors.current++;
    if (data?.fatal || audioErrors.current >= 2) return switchSource(true, true);
    if (!audioErrorTimer.current) {
      audioErrorTimer.current = setTimeout(() => {
        audioErrorTimer.current = null;
        switchSource(true, true);
      }, 8000);
    }
    return true;
  }, [switchSource]);

  const onAudioProgress = useCallback(() => {
    audioErrors.current = 0;
    if (audioErrorTimer.current) clearTimeout(audioErrorTimer.current);
    audioErrorTimer.current = null;
  }, []);

  useEffect(() => {
    mode.current = Boolean(options.fallback);
    setVideoOnly(Boolean(options.fallback));
    progress.current = { time: 0, at: Date.now(), failed: false };
    snapshot.current = null;
    cooldown.current = 0;
    onAudioProgress();
    return onAudioProgress;
  }, [options.primary, options.fallback, onAudioProgress]);

  useEffect(() => {
    const check = () => {
      const { ranges, video, fallback, playingIntent, onStall } = latest.current;
      if (!fallback) return;
      const element = video.current;
      if (!element) return;
      const time = element.currentTime;
      const now = Date.now();
      const previous = progress.current;
      if (!playingIntent.current || element.ended || Math.abs(time - previous.time) > 0.05) {
        progress.current = { time, at: now, failed: false };
      } else if (!previous.failed && now - previous.at >= 8000) {
        if (!mode.current) switchSource(true, true);
        else {
          progress.current.failed = true;
          onStall?.();
        }
        return;
      }
      if (!ranges || snapshot.current) return;
      const available = ranges.some((range) => time >= range.start + 0.1 && time < range.end - 0.1);
      if (!mode.current && !available) switchSource(true);
      else if (mode.current && available && now >= cooldown.current &&
        ranges.some((range) => time >= range.start + 0.1 && time + 4 <= range.end)) switchSource(false);
    };
    const timer = setInterval(check, 500);
    return () => clearInterval(timer);
  }, [switchSource]);

  return { videoOnly, source: videoOnly && options.fallback ? options.fallback : options.primary,
    snapshot, switchSource, onAudioError, onAudioProgress };
}
