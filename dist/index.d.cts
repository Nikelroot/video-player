import { HlsConfig } from 'hls.js';
import React, { ReactNode } from 'react';

type ControlsVariant = 'full' | 'fullscreen-only' | 'tiny' | 'none';

type PointerHandler = (e: React.PointerEvent<HTMLElement>) => void;
interface VideoPlayerHandle {
    play: () => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    fullscreen: () => void;
    getVideoElement: () => HTMLVideoElement | null;
}
interface VideoPlayerMessages {
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
interface VideoPlayerActiveChangePayload {
    video: HTMLVideoElement | null;
    reason: 'play' | 'pause' | 'ref' | 'destroy' | 'seek';
}
interface VideoPlayerPlaybackError {
    error: unknown;
    data?: unknown;
    message: string;
    details: string[];
}
interface VideoPlayerProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'controls' | 'autoPlay' | 'muted' | 'title' | 'onError' | 'onTimeUpdate' | 'onDurationChange' | 'onPlay' | 'onPause'> {
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
    duration?: number;
    onTimeChange?: (time: number, video: HTMLVideoElement) => void;
    onDurationChange?: (duration: number, video: HTMLVideoElement) => void;
    videoRef?: React.Ref<HTMLVideoElement>;
    onVideoRefChange?: (video: HTMLVideoElement | null) => void;
    onActiveChange?: (payload: VideoPlayerActiveChangePayload) => void;
    onPlaybackError?: (payload: VideoPlayerPlaybackError) => void;
    onVideoClick?: () => void;
    onVideoDoubleClick?: () => void;
    exclusivePlayback?: boolean | {
        pauseOthers: (video: HTMLVideoElement) => void;
    };
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
declare function hasNativeHlsSupport(): boolean;
declare const VideoPlayer: React.NamedExoticComponent<VideoPlayerProps & React.RefAttributes<VideoPlayerHandle>>;

export { type ControlsVariant, VideoPlayer, type VideoPlayerActiveChangePayload, type VideoPlayerHandle, type VideoPlayerMessages, type VideoPlayerPlaybackError, type VideoPlayerProps, VideoPlayer as default, hasNativeHlsSupport };
