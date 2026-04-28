'use client';

import type Hls from 'hls.js';
import type { HlsConfig } from 'hls.js';
import React, {
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { VideoPlayerControls, type ControlsVariant } from './controls';
import { confLiveStability, confVod, withCredentialsConfig } from './configs';
import { formatPlaybackErrorDetails, getPlaybackErrorCodeText } from './errorDetails';
import { VideoPlayerStyles } from './styles';
import { createThrottledNumberFn, useWindowWidth } from './utils';

type PointerHandler = (e: React.PointerEvent<HTMLElement>) => void;
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};
type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
  webkitEnterFullscreen?: () => Promise<void> | void;
};
type VideoErrorState = {
  message: string;
  error: unknown;
  data?: unknown;
  details: string[];
};

export interface VideoPlayerHandle {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  fullscreen: () => void;
  getVideoElement: () => HTMLVideoElement | null;
}

export interface VideoPlayerMessages {
  defaultError?: string;
  aborted?: string;
  network?: string;
  decode?: string;
  unsupported?: string;
  playFailed?: string;
  streamLoadFailed?: string;
  streamDecodeFailed?: string;
  retry?: string;
}

export interface VideoPlayerActiveChangePayload {
  video: HTMLVideoElement | null;
  reason: 'play' | 'pause' | 'ref' | 'destroy' | 'seek';
}

export interface VideoPlayerPlaybackError {
  error: unknown;
  data?: unknown;
  message: string;
  details: string[];
}

export interface VideoPlayerProps
  extends Omit<
    React.VideoHTMLAttributes<HTMLVideoElement>,
    | 'src'
    | 'controls'
    | 'autoPlay'
    | 'muted'
    | 'title'
    | 'onError'
    | 'onTimeUpdate'
    | 'onDurationChange'
    | 'onPlay'
    | 'onPause'
  > {
  videoSrc: string;
  sourceType?: 'auto' | 'hls' | 'native';
  type?: string;
  controlsVariant: ControlsVariant;
  active?: boolean;
  autoPlay?: boolean;
  preload?: '' | 'none' | 'auto' | 'metadata';
  loop?: boolean;
  poster?: string;
  live?: boolean;
  title?: ReactNode;
  videoTopBar?: ReactNode;
  videoRightBar?: ReactNode;
  alwaysShowSegments?: boolean;
  initialTime?: number;
  reloadKey?: string | number | boolean | null;
  playOnClick?: boolean;
  handleClick?: boolean;
  scrollTo?: boolean;
  defaultMuted?: boolean;
  muted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  defaultPlaying?: boolean;
  playing?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  currentTime?: number;
  duration?: number;
  onTimeChange?: (time: number, video: HTMLVideoElement) => void;
  onDurationChange?: (duration: number, video: HTMLVideoElement) => void;
  videoRef?: React.Ref<HTMLVideoElement>;
  onVideoRefChange?: (video: HTMLVideoElement | null) => void;
  onActiveChange?: (payload: VideoPlayerActiveChangePayload) => void;
  onPlaybackError?: (payload: VideoPlayerPlaybackError) => void;
  onVideoClick?: () => void;
  onVideoDoubleClick?: () => void;
  exclusivePlayback?: boolean | { pauseOthers: (video: HTMLVideoElement) => void };
  hlsConfig?: Partial<HlsConfig>;
  vodHlsConfig?: Partial<HlsConfig>;
  liveHlsConfig?: Partial<HlsConfig>;
  hlsCredentials?: RequestCredentials;
  crossOrigin?: React.VideoHTMLAttributes<HTMLVideoElement>['crossOrigin'];
  messages?: VideoPlayerMessages;
  onPointerDown?: PointerHandler;
  onPointerMove?: PointerHandler;
  onPointerUp?: PointerHandler;
  onPointerCancel?: PointerHandler;
  accentColor?: string;
}

const defaultMessages: Required<VideoPlayerMessages> = {
  defaultError: 'Не удалось загрузить видео',
  aborted: 'Загрузка видео была прервана',
  network: 'Ошибка сети при загрузке видео',
  decode: 'Не удалось декодировать видео',
  unsupported: 'Формат видео не поддерживается',
  playFailed: 'Не удалось начать воспроизведение',
  streamLoadFailed: 'Ошибка загрузки видеопотока',
  streamDecodeFailed: 'Не удалось декодировать видеопоток',
  retry: 'Повторить',
};

const MAX_NET_RETRIES = 3;
const MAX_FATAL_RELOADS = 3;
const LIVE_STALL_WINDOW_MS = 20000;
const LIVE_STALLS_BEFORE_STABILITY = 3;
let hlsCtorPromise: Promise<typeof import('hls.js').default> | null = null;
let activeExclusiveVideo: HTMLVideoElement | null = null;

const loadHlsCtor = () => {
  if (!hlsCtorPromise) {
    hlsCtorPromise = import('hls.js').then((mod) => mod.default);
  }
  return hlsCtorPromise;
};

const isInterruptedPlayRequestError = (error: unknown) => {
  if (!(error instanceof Error)) return false;

  return (
    error.name === 'AbortError' ||
    error.message.includes('The play() request was interrupted by a new load request') ||
    error.message.includes('The play() request was interrupted')
  );
};

const canAttemptPlayback = (video: HTMLVideoElement | null | undefined) => {
  return !!video && video.readyState >= HTMLMediaElement.HAVE_METADATA;
};

export function hasNativeHlsSupport() {
  if (typeof navigator === 'undefined' || typeof document === 'undefined') return false;

  const isSafari = /^((?!chrome|android|firefox|opera|edg).)*safari/i.test(navigator.userAgent);
  if (!isSafari) return false;

  const video = document.createElement('video');
  const mimes = ['application/vnd.apple.mpegurl', 'application/x-mpegURL'];
  return mimes.some((t) => {
    const r = video.canPlayType(t);
    return r === 'probably' || r === 'maybe';
  });
}

const getNativeVideoErrorMessage = (error: MediaError | null | undefined, messages: Required<VideoPlayerMessages>) => {
  if (!error) return messages.defaultError;

  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return messages.aborted;
    case MediaError.MEDIA_ERR_NETWORK:
      return messages.network;
    case MediaError.MEDIA_ERR_DECODE:
      return messages.decode;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return messages.unsupported;
    default:
      return messages.defaultError;
  }
};

const clampTime = (time: number, duration: number) => {
  const safeTime = Number.isFinite(time) ? time : 0;
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  return safeDuration > 0 ? Math.max(0, Math.min(safeTime, safeDuration)) : Math.max(0, safeTime);
};

const isLikelyHlsSource = (src: string) => {
  try {
    const url = new URL(src, 'http://video-player.local');
    return /\.m3u8$/i.test(url.pathname) || /\.m3u8($|[?#])/i.test(src);
  } catch {
    return /\.m3u8($|[?#])/i.test(src);
  }
};

const assignRef = <T,>(ref: React.Ref<T> | undefined, value: T | null) => {
  if (!ref) return;

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  (ref as { current: T | null }).current = value;
};

const isEditableKeyTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

const VideoPlayerBase = (props: VideoPlayerProps, ref: React.ForwardedRef<VideoPlayerHandle>) => {
  const {
    controlsVariant = 'none',
    active,
    autoPlay = false,
    preload = 'metadata',
    loop = false,
    type,
    sourceType = 'auto',
    onVideoClick,
    onVideoDoubleClick,
    playOnClick = true,
    live = false,
    videoTopBar: VideoTopBar,
    videoRightBar: VideoRightBar,
    defaultPlaying = false,
    playing: playingProp,
    poster,
    alwaysShowSegments = false,
    initialTime = 0,
    reloadKey,
    videoRef: externalVideoRef,
    onVideoRefChange,
    handleClick = true,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    exclusivePlayback = true,
    onMutedChange,
    onPlayingChange,
    onTimeChange,
    onDurationChange,
    onActiveChange,
    onPlaybackError,
    title,
    scrollTo = true,
    muted: mutedProp,
    defaultMuted = false,
    currentTime: currentTimeProp,
    duration: durationProp,
    hlsConfig,
    vodHlsConfig,
    liveHlsConfig,
    hlsCredentials = 'include',
    crossOrigin = 'use-credentials',
    messages: messagesProp,
    accentColor,
    videoSrc: rawVideoSrc = '',
    ...videoProps
  } = props;

  const videoSrc = rawVideoSrc.replaceAll(' ', '%20').replaceAll('#', '%23');

  const messages = useMemo(() => ({ ...defaultMessages, ...messagesProp }), [messagesProp]);
  const [, isMobile, mobileType] = useWindowWidth();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const netRetryCount = useRef(0);
  const mediaRecoverCount = useRef(0);
  const fatalReloadCount = useRef(0);
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stalledNudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveStabilityMode = useRef(false);
  const liveStallEvents = useRef<number[]>([]);
  const controlTime = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playingState, setPlayingState] = useState(!!defaultPlaying);
  const [mutedState, setMutedState] = useState(!!defaultMuted);
  const [durationState, setDurationState] = useState(0);
  const [currentTimeState, setCurrentTimeState] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControl, setControlVisible] = useState(true);
  const [errorState, setErrorState] = useState<VideoErrorState | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const playing = playingProp ?? playingState;
  const muted = mutedProp ?? mutedState;
  const isDurationControlled = durationProp !== undefined;
  const isCurrentTimeControlled = currentTimeProp !== undefined;
  const duration = durationProp ?? durationState;
  const currentTime = currentTimeProp ?? currentTimeState;
  const fullscreenAllowed = active ?? true;
  const onTimeChangeRef = useRef(onTimeChange);
  const onDurationChangeRef = useRef(onDurationChange);

  const setTimeD = useRef(
    createThrottledNumberFn((value: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = value;
    }, 30)
  );

  const clearTimers = useCallback(() => {
    if (reloadTimer.current) {
      clearTimeout(reloadTimer.current);
      reloadTimer.current = null;
    }
    if (stalledNudgeTimer.current) {
      clearTimeout(stalledNudgeTimer.current);
      stalledNudgeTimer.current = null;
    }
    if (controlTime.current) {
      clearTimeout(controlTime.current);
      controlTime.current = null;
    }
  }, []);

  const setNextPlaying = useCallback(
    (value: boolean) => {
      if (playingProp === undefined) setPlayingState(value);
      onPlayingChange?.(value);
    },
    [onPlayingChange, playingProp]
  );

  const setNextMuted = useCallback(
    (value: boolean) => {
      if (mutedProp === undefined) setMutedState(value);
      const el = videoRef.current;
      if (el) el.muted = value;
      onMutedChange?.(value);
    },
    [mutedProp, onMutedChange]
  );

  const clearErrorState = useCallback(() => {
    setErrorState((prev) => (prev ? null : prev));
  }, []);

  const reportError = useCallback(
    (error: unknown, data?: unknown, message: string = messages.defaultError) => {
      const details = formatPlaybackErrorDetails(error, data);
      const code = getPlaybackErrorCodeText(error);

      setNextPlaying(false);
      setErrorState({ message, error, data, details });
      console.error('[VideoPlayer] playback error', {
        message,
        code,
        details,
        error,
        data,
      });
      onPlaybackError?.({ error, data, message, details });
    },
    [messages.defaultError, onPlaybackError, setNextPlaying]
  );

  const notifyActiveChange = useCallback(
    (video: HTMLVideoElement | null, reason: VideoPlayerActiveChangePayload['reason']) => {
      onActiveChange?.({ video, reason });
    },
    [onActiveChange]
  );

  useEffect(() => {
    onTimeChangeRef.current = onTimeChange;
  }, [onTimeChange]);

  useEffect(() => {
    onDurationChangeRef.current = onDurationChange;
  }, [onDurationChange]);

  const onTime = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    const nextTime = Number.isFinite(el.currentTime) ? el.currentTime : 0;
    if (!isCurrentTimeControlled) setCurrentTimeState(nextTime);
    onTimeChangeRef.current?.(nextTime, el);
  }, [isCurrentTimeControlled]);

  const onDur = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    const nextDuration = Number.isFinite(el.duration) ? el.duration : 0;
    if (!isDurationControlled) setDurationState(nextDuration);
    onDurationChangeRef.current?.(nextDuration, el);
  }, [isDurationControlled]);

  const setVideoEl = useCallback(
    (el: HTMLVideoElement | null) => {
      const prev = videoRef.current;
      if (prev === el) return;

      if (prev) {
        prev.removeEventListener('timeupdate', onTime);
        prev.removeEventListener('durationchange', onDur);
      }

      videoRef.current = el;
      assignRef(externalVideoRef, el);
      onVideoRefChange?.(el);
      notifyActiveChange(el, 'ref');

      if (!el) return;
      el.muted = muted;
      el.addEventListener('timeupdate', onTime);
      el.addEventListener('durationchange', onDur);
    },
    [externalVideoRef, muted, notifyActiveChange, onDur, onTime, onVideoRefChange]
  );

  const pauseOtherVideos = useCallback(
    (el: HTMLVideoElement) => {
      if (!exclusivePlayback) return;

      if (typeof exclusivePlayback === 'object') {
        exclusivePlayback.pauseOthers(el);
        return;
      }

      if (activeExclusiveVideo && activeExclusiveVideo !== el && !activeExclusiveVideo.paused) {
        activeExclusiveVideo.pause();
      }
      activeExclusiveVideo = el;
    },
    [exclusivePlayback]
  );

  const playAction = useCallback(async () => {
    const el = videoRef.current;
    if (!el) return;

    pauseOtherVideos(el);

    try {
      await el.play();
      clearErrorState();
      setNextPlaying(true);
      notifyActiveChange(el, 'play');
    } catch (e) {
      if (isInterruptedPlayRequestError(e)) return;
      console.debug(e);
      reportError(e, { type: 'play' }, messages.playFailed);
    }

    if (scrollTo === true) {
      const rect = el.getBoundingClientRect();
      const inViewport =
        rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;

      if (!inViewport) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    }
  }, [clearErrorState, messages.playFailed, notifyActiveChange, pauseOtherVideos, reportError, scrollTo, setNextPlaying]);

  const pauseAction = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    setNextPlaying(false);
    notifyActiveChange(el, 'pause');
  }, [notifyActiveChange, setNextPlaying]);

  const seekSetTime = useCallback(
    (value: number) => {
      const el = videoRef.current;
      if (!el) return;

      const next = clampTime(value, duration);
      setTimeD.current(next);
      if (currentTimeProp === undefined) setCurrentTimeState(next);
      notifyActiveChange(el, 'seek');
    },
    [currentTimeProp, duration, notifyActiveChange]
  );

  const seekPrevAction = useCallback(
    (sec: number = 15) => {
      const el = videoRef.current;
      if (!el) return;
      seekSetTime(el.currentTime - sec);
    },
    [seekSetTime]
  );

  const seekNextAction = useCallback(
    (sec: number = 15) => {
      const el = videoRef.current;
      if (!el) return;
      seekSetTime(el.currentTime + sec);
    },
    [seekSetTime]
  );

  const toggleAction = useCallback(
    (force?: boolean) => {
      const el = videoRef.current;
      if (!el) return;

      if (force || el.paused) {
        void playAction();
      } else {
        pauseAction();
      }
    },
    [pauseAction, playAction]
  );

  const nudgeOnStall = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, v.currentTime + 0.05);
  }, []);

  const shouldSwitchLiveToStability = useCallback(() => {
    if (!live || liveStabilityMode.current) return false;

    const now = Date.now();
    liveStallEvents.current = [...liveStallEvents.current.filter((ts) => now - ts <= LIVE_STALL_WINDOW_MS), now];

    if (liveStallEvents.current.length < LIVE_STALLS_BEFORE_STABILITY) return false;

    liveStabilityMode.current = true;
    liveStallEvents.current = [];
    return true;
  }, [live]);

  const resolvedHlsConfig = useCallback(() => {
    const modeConfig = live ? liveHlsConfig : vodHlsConfig;
    const base = live ? confLiveStability : confVod;
    return withCredentialsConfig(
      {
        ...base,
        ...hlsConfig,
        ...modeConfig,
      },
      hlsCredentials
    );
  }, [hlsConfig, hlsCredentials, live, liveHlsConfig, vodHlsConfig]);

  const loadVideo = useCallback(
    async (startAt: number = initialTime) => {
      const startVideoRef = videoRef.current;
      if (!startVideoRef) return;
      let HlsCtor: typeof Hls;
      try {
        HlsCtor = await loadHlsCtor();
      } catch (error) {
        reportError(error, { type: 'hls-loader', src: videoSrc }, messages.streamLoadFailed);
        return;
      }
      if (!videoRef.current || videoRef.current !== startVideoRef) return;
      const video = videoRef.current;
      if (!video) return;

      const h = new HlsCtor(resolvedHlsConfig());
      hlsRef.current = h;

      h.on(HlsCtor.Events.ERROR, (_evt, data) => {
        const { type: errorType, details, fatal } = data;

        if (details === HlsCtor.ErrorDetails.BUFFER_APPEND_ERROR || details === 'bufferAppendingError') return;

        if (!fatal) {
          switch (details) {
            case HlsCtor.ErrorDetails.BUFFER_STALLED_ERROR:
            case HlsCtor.ErrorDetails.BUFFER_NUDGE_ON_STALL:
              if (!stalledNudgeTimer.current) {
                stalledNudgeTimer.current = setTimeout(() => {
                  stalledNudgeTimer.current = null;
                  nudgeOnStall();
                }, 200);
              }
              if (shouldSwitchLiveToStability()) {
                const resumeTime = videoRef.current?.currentTime || 0;
                clearTimers();
                reloadTimer.current = setTimeout(() => {
                  if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                  }
                  void loadVideo(resumeTime);
                }, 250);
              }
              return;
            default:
              return;
          }
        }

        const resumeTime = videoRef.current?.currentTime || 0;

        if (errorType === HlsCtor.ErrorTypes.NETWORK_ERROR) {
          if (netRetryCount.current < MAX_NET_RETRIES) {
            netRetryCount.current += 1;
            const backoffMs = 400 * Math.pow(2, netRetryCount.current - 1);
            clearErrorState();
            clearTimers();
            reloadTimer.current = setTimeout(() => {
              if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
              }
              void loadVideo(resumeTime);
            }, backoffMs);
            return;
          }
          h.destroy();
          if (hlsRef.current === h) {
            hlsRef.current = null;
          }
          reportError(details, data, messages.streamLoadFailed);
          return;
        }

        if (errorType === HlsCtor.ErrorTypes.MEDIA_ERROR) {
          if (mediaRecoverCount.current === 0) {
            mediaRecoverCount.current = 1;
            clearErrorState();
            h.recoverMediaError();
            return;
          }
          if (mediaRecoverCount.current === 1) {
            mediaRecoverCount.current = 2;
            clearErrorState();
            h.swapAudioCodec();
            h.recoverMediaError();
            return;
          }
        }

        if (fatalReloadCount.current >= MAX_FATAL_RELOADS) {
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
          reportError(
            details,
            data,
            errorType === HlsCtor.ErrorTypes.MEDIA_ERROR ? messages.streamDecodeFailed : messages.streamLoadFailed
          );
          return;
        }

        fatalReloadCount.current += 1;
        clearErrorState();
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        void loadVideo(resumeTime);
      });

      h.on(HlsCtor.Events.MEDIA_ATTACHED, () => {
        h.loadSource(videoSrc);
      });
      h.on(HlsCtor.Events.MANIFEST_PARSED, () => {
        fatalReloadCount.current = 0;
        netRetryCount.current = 0;
        mediaRecoverCount.current = 0;
        if (!live && startAt > 0) {
          h.startLoad(startAt);
          video.currentTime = startAt;
        } else {
          h.startLoad();
        }
        if (autoPlay) void playAction();
      });
      h.attachMedia(video);
    },
    [
      autoPlay,
      clearErrorState,
      clearTimers,
      initialTime,
      live,
      messages.streamDecodeFailed,
      messages.streamLoadFailed,
      nudgeOnStall,
      playAction,
      reportError,
      resolvedHlsConfig,
      shouldSwitchLiveToStability,
      videoSrc,
    ]
  );

  const loadVideoNative = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = videoSrc;
    video.currentTime = initialTime;
    if (autoPlay) void playAction();
  }, [autoPlay, initialTime, playAction, videoSrc]);

  const loadVideoHls = useCallback(async () => {
    const video = videoRef.current;
    const canNativeHls = !!video?.canPlayType && video.canPlayType('application/vnd.apple.mpegurl') !== '';
    let HlsCtor: typeof Hls;
    try {
      HlsCtor = await loadHlsCtor();
    } catch (error) {
      reportError(error, { type: 'hls-loader', src: videoSrc }, messages.streamLoadFailed);
      return;
    }
    if (!videoRef.current || videoRef.current !== video) return;

    if (HlsCtor.isSupported()) {
      void loadVideo(initialTime);
      return;
    }
    if (canNativeHls) {
      loadVideoNative();
      return;
    }
    reportError(null, { type: 'hls', src: videoSrc, reason: 'HLS is not supported in this browser' }, messages.unsupported);
  }, [initialTime, loadVideo, loadVideoNative, messages.streamLoadFailed, messages.unsupported, reportError, videoSrc]);

  const destroy = useCallback(() => {
    clearTimers();

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const v = videoRef.current;
    if (v) {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('durationchange', onDur);
      v.pause();
      v.removeAttribute('src');
      v.load();
      if (activeExclusiveVideo === v) activeExclusiveVideo = null;
    }

    videoRef.current = null;
    onVideoRefChange?.(null);
    notifyActiveChange(null, 'destroy');
    setNextPlaying(false);
    if (durationProp === undefined) setDurationState(0);
    if (currentTimeProp === undefined) setCurrentTimeState(0);
  }, [
    clearTimers,
    currentTimeProp,
    durationProp,
    notifyActiveChange,
    onDur,
    onTime,
    onVideoRefChange,
    setNextPlaying,
  ]);

  const videoClickHandler = useCallback(() => {
    if (!handleClick) return;
    if (playOnClick) toggleAction();
    onVideoClick?.();
  }, [handleClick, onVideoClick, playOnClick, toggleAction]);

  const fullScreenAction = useCallback(() => {
    if (typeof document === 'undefined') return;

    const doc = document as FullscreenDocument;
    const videoEl = videoRef.current as FullscreenElement | null;
    const containerEl = containerRef.current as FullscreenElement | null;

    const isFs =
      !!document.fullscreenElement ||
      !!doc.webkitFullscreenElement ||
      !!doc.mozFullScreenElement ||
      !!doc.msFullscreenElement;

    if (isFs) {
      if (document.exitFullscreen) void document.exitFullscreen();
      else if (doc.webkitExitFullscreen) void doc.webkitExitFullscreen();
      else if (doc.msExitFullscreen) void doc.msExitFullscreen();
      return;
    }

    if (!fullscreenAllowed) return;

    if (containerEl) {
      if (containerEl.requestFullscreen) void containerEl.requestFullscreen();
      else if (containerEl.webkitRequestFullscreen) void containerEl.webkitRequestFullscreen();
      else if (containerEl.msRequestFullscreen) void containerEl.msRequestFullscreen();
      else if (videoEl && videoEl.webkitEnterFullscreen) void videoEl.webkitEnterFullscreen();
      return;
    }

    if (videoEl) {
      if (videoEl.requestFullscreen) void videoEl.requestFullscreen();
      else if (videoEl.webkitEnterFullscreen) void videoEl.webkitEnterFullscreen();
    }
  }, [fullscreenAllowed]);

  const videoDbClickHandler = useCallback(() => {
    if (!handleClick) return;
    fullScreenAction();
    onVideoDoubleClick?.();
  }, [fullScreenAction, handleClick, onVideoDoubleClick]);

  const showClickHandler = useCallback(() => {
    setControlVisible((st) => !st);
  }, []);

  const retryLoadHandler = useCallback(() => {
    clearErrorState();
    setReloadToken((value) => value + 1);
  }, [clearErrorState]);

  const videoErrorHandler = useCallback(() => {
    const video = videoRef.current;
    const error = video?.error;
    const src = video?.currentSrc || videoSrc;

    if (hlsRef.current && src.startsWith('blob:')) return;

    reportError(error, { type: 'native', src }, getNativeVideoErrorMessage(error, messages));
  }, [messages, reportError, videoSrc]);

  const videoLoadedHandler = useCallback(() => {
    clearErrorState();
  }, [clearErrorState]);

  const mouseMoveHandler = useCallback(() => {
    if (controlTime.current) clearTimeout(controlTime.current);
    setControlVisible(true);
    controlTime.current = setTimeout(() => {
      setControlVisible(false);
    }, 1000 * 10);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      play: playAction,
      pause: pauseAction,
      seek: seekSetTime,
      fullscreen: fullScreenAction,
      getVideoElement: () => videoRef.current,
    }),
    [fullScreenAction, pauseAction, playAction, seekSetTime]
  );

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (playingProp === undefined) return;
    if (!canAttemptPlayback(videoRef.current)) return;
    if (playingProp) void playAction();
    else pauseAction();
  }, [pauseAction, playAction, playingProp]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || currentTimeProp === undefined) return;
    if (Math.abs(el.currentTime - currentTimeProp) < 0.25) return;
    el.currentTime = clampTime(currentTimeProp, duration);
  }, [currentTimeProp, duration]);

  useEffect(() => {
    if (!videoRef.current) return;
    clearErrorState();
    fatalReloadCount.current = 0;
    netRetryCount.current = 0;
    mediaRecoverCount.current = 0;
    liveStabilityMode.current = false;
    liveStallEvents.current = [];

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (sourceType === 'native' || type === 'video') loadVideoNative();
    else if (sourceType === 'hls') void loadVideo(initialTime);
    else if (isLikelyHlsSource(videoSrc)) void loadVideoHls();
    else loadVideoNative();

    return () => {
      clearTimers();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [
    clearErrorState,
    clearTimers,
    loadVideo,
    loadVideoHls,
    loadVideoNative,
    initialTime,
    reloadKey,
    reloadToken,
    sourceType,
    type,
    videoSrc,
  ]);

  useEffect(() => {
    if (!autoPlay) return;
    if (!canAttemptPlayback(videoRef.current)) return;
    void playAction();
  }, [autoPlay, playAction]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyF') return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (active !== true) return;
      if (isEditableKeyTarget(event.target)) return;

      event.preventDefault();
      fullScreenAction();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, fullScreenAction]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const doc = document as FullscreenDocument;
    const handleFsChange = () => {
      const fs =
        !!document.fullscreenElement ||
        !!doc.webkitFullscreenElement ||
        !!doc.mozFullScreenElement ||
        !!doc.msFullscreenElement;
      setIsFullscreen(fs);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange as EventListener);
    document.addEventListener('mozfullscreenchange', handleFsChange as EventListener);
    document.addEventListener('MSFullscreenChange', handleFsChange as EventListener);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange as EventListener);
      document.removeEventListener('mozfullscreenchange', handleFsChange as EventListener);
      document.removeEventListener('MSFullscreenChange', handleFsChange as EventListener);
    };
  }, []);

  useEffect(() => {
    return () => {
      setTimeD.current.cancel();
      destroy();
    };
  }, [destroy]);

  const lastActiveState = useRef(active);
  useEffect(() => {
    const prevActive = lastActiveState.current;
    lastActiveState.current = active;

    if (active === true && prevActive !== true) {
      void playAction();
    }
  }, [active, playAction]);

  return (
    <VideoPlayerStyles
      ref={containerRef}
      onMouseMove={mouseMoveHandler}
      className={isFullscreen ? 'VideoPlayer VideoPlayer--fullscreen' : 'VideoPlayer'}
      type={type}
      $isMobile={isMobile}
      $mobileType={mobileType}
      $showControl={showControl}
      $alwaysShowSegments={alwaysShowSegments}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel || onPointerUp}
      $color={accentColor}
    >
      {VideoTopBar && <div className="video-top-bar">{VideoTopBar}</div>}

      {isFullscreen && VideoRightBar && !isMobile && (
        <div className="video-right-bar">
          <div onClick={showClickHandler} className="video-right-bar-toggle">
            {'<'}
          </div>
          <div className="video-right-bar-content">{VideoRightBar}</div>
        </div>
      )}

      {!isFullscreen && VideoRightBar && (
        <div className="video-right-bar">
          <div onClick={showClickHandler} className="video-right-bar-toggle">
            {'<'}
          </div>
          <div className="video-right-bar-content">{VideoRightBar}</div>
        </div>
      )}

      <div className="video-wrapper">
        <video
          {...videoProps}
          controls={false}
          ref={setVideoEl}
          crossOrigin={crossOrigin}
          playsInline
          muted={muted}
          preload={preload}
          loop={loop}
          onPlay={() => setNextPlaying(true)}
          onPause={() => setNextPlaying(false)}
          onEnded={() => setNextPlaying(false)}
          onLoadedData={videoLoadedHandler}
          onCanPlay={videoLoadedHandler}
          onError={videoErrorHandler}
          onClick={videoClickHandler}
          onDoubleClick={videoDbClickHandler}
          poster={poster}
        />
        {errorState && (
          <div className="video-error-overlay">
            <div className="video-error-content">
              <div className="video-error-title">{errorState.message}</div>
              {errorState.details.length > 0 && (
                <div className="video-error-details">
                  {errorState.details.map((detail) => (
                    <div key={detail} className="video-error-detail">
                      {detail}
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={retryLoadHandler} className="video-error-retry">
                {messages.retry}
              </button>
            </div>
          </div>
        )}
      </div>

      <VideoPlayerControls
        variant={controlsVariant}
        fullScreenAction={fullScreenAction}
        fullscreenAllowed={fullscreenAllowed}
        showControl={showControl}
        playAction={playAction}
        pauseAction={pauseAction}
        seekSetTime={seekSetTime}
        seekPrevAction={seekPrevAction}
        seekNextAction={seekNextAction}
        playing={playing}
        muted={muted}
        onMutedChange={setNextMuted}
        duration={duration}
        currentTime={currentTime}
        title={title}
      />
    </VideoPlayerStyles>
  );
};

export const VideoPlayer = memo(forwardRef(VideoPlayerBase));
export default VideoPlayer;
