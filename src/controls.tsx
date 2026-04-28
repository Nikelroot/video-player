'use client';

import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { SeekSliderStyled, VideoPlayerControlStyles } from './styles';
import { formatTime, useWindowWidth } from './utils';

export type ControlsVariant = 'full' | 'fullscreen-only' | 'tiny' | 'none';

interface SeekSliderProps {
  playAction: () => void | Promise<void>;
  duration: number;
  currentTime: number;
  seekSetTime: (time: number) => void;
}

const SeekSlider = ({ playAction, duration, currentTime, seekSetTime }: SeekSliderProps) => {
  const clickHandler = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeCurrentTime = Math.max(0, Math.min(Number.isFinite(currentTime) ? currentTime : 0, safeDuration || Infinity));
  const completeChange = () => {
    void playAction();
  };

  return (
    <SeekSliderStyled onClick={clickHandler} className="seek-slider">
      <input
        aria-label="Seek"
        className="seek-range"
        disabled={safeDuration <= 0}
        max={safeDuration}
        min={0}
        onChange={(e) => seekSetTime(Number(e.currentTarget.value))}
        onKeyUp={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter' || e.key === ' ') completeChange();
        }}
        onPointerUp={completeChange}
        step="any"
        type="range"
        value={safeCurrentTime}
        title={formatTime(safeCurrentTime)}
      />
    </SeekSliderStyled>
  );
};

const TimeBlock = ({ duration, currentTime }: { duration: number; currentTime: number }) => {
  return (
    <span className="video-player-time">
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  );
};

type IconName = 'back' | 'forward' | 'fullscreen' | 'mute' | 'pause' | 'play' | 'sound';

const Icon = ({ name }: { name: IconName }) => {
  const paths: Record<IconName, ReactNode> = {
    back: (
      <>
        <path d="M11 7l-6 5 6 5V7z" />
        <path d="M19 7l-6 5 6 5V7z" />
      </>
    ),
    forward: (
      <>
        <path d="M5 7l6 5-6 5V7z" />
        <path d="M13 7l6 5-6 5V7z" />
      </>
    ),
    fullscreen: (
      <>
        <path d="M5 10V5h5" />
        <path d="M14 5h5v5" />
        <path d="M19 14v5h-5" />
        <path d="M10 19H5v-5" />
      </>
    ),
    mute: (
      <>
        <path d="M4 10v4h4l5 4V6l-5 4H4z" />
        <path d="M17 9l4 6" />
        <path d="M21 9l-4 6" />
      </>
    ),
    pause: (
      <>
        <path d="M8 6h3v12H8z" />
        <path d="M13 6h3v12h-3z" />
      </>
    ),
    play: <path d="M8 5v14l11-7L8 5z" />,
    sound: (
      <>
        <path d="M4 10v4h4l5 4V6l-5 4H4z" />
        <path d="M16 9a4 4 0 010 6" />
        <path d="M18.5 6.5a8 8 0 010 11" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className="video-player-icon" focusable="false" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
};

const ControlButton = ({
  icon,
  label,
  onClick,
}: {
  icon: IconName;
  label: string;
  onClick: () => void | Promise<void>;
}) => {
  return (
    <button aria-label={label} className="video-player-control-button" onClick={() => void onClick()} title={label} type="button">
      <Icon name={icon} />
    </button>
  );
};

export interface VideoPlayerControlsProps {
  variant: ControlsVariant;
  fullScreenAction: () => void;
  showControl: boolean;
  playAction: () => void | Promise<void>;
  pauseAction: () => void;
  seekSetTime: (time: number) => void;
  seekPrevAction: (sec?: number) => void;
  seekNextAction: (sec?: number) => void;
  playing: boolean;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  duration: number;
  currentTime: number;
  title?: ReactNode;
}

const stopControlClick = (e: MouseEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
};

export const VideoPlayerControls = (props: VideoPlayerControlsProps) => {
  const {
    variant,
    fullScreenAction,
    showControl,
    playAction,
    pauseAction,
    seekSetTime,
    seekPrevAction,
    seekNextAction,
    playing,
    muted,
    onMutedChange,
    duration,
    currentTime,
    title,
  } = props;
  const [, isMobile] = useWindowWidth();

  if (variant === 'none') return null;

  if (variant === 'tiny') {
    return (
      <VideoPlayerControlStyles $tiny $isMobile={isMobile} onClick={stopControlClick} $showControl={showControl}>
        <div className="video-player-control-row">
          <div className="full" />
          <SeekSlider playAction={playAction} duration={duration} currentTime={currentTime} seekSetTime={seekSetTime} />
        </div>
      </VideoPlayerControlStyles>
    );
  }

  if (variant === 'fullscreen-only') {
    return (
      <VideoPlayerControlStyles $isMobile={isMobile} onClick={stopControlClick} $showControl={showControl}>
        <div className="video-player-control-row">
          <div className="full" />
          <ControlButton icon={muted ? 'mute' : 'sound'} label={muted ? 'Unmute' : 'Mute'} onClick={() => onMutedChange(!muted)} />
          <ControlButton icon="fullscreen" label="Fullscreen" onClick={fullScreenAction} />
        </div>
      </VideoPlayerControlStyles>
    );
  }

  return (
    <VideoPlayerControlStyles $isMobile={isMobile} onClick={stopControlClick} $showControl={showControl}>
      <div className="video-player-control-row">
        {playing ? (
          <ControlButton icon="pause" label="Pause" onClick={pauseAction} />
        ) : (
          <ControlButton icon="play" label="Play" onClick={playAction} />
        )}
        <ControlButton icon="back" label="Back 15 seconds" onClick={() => seekPrevAction()} />
        <ControlButton icon="forward" label="Forward 15 seconds" onClick={() => seekNextAction()} />
        <span className="video-player-control-title" title={typeof title === 'string' ? title : undefined}>
          {title}
        </span>
        <div className="full" />
        <SeekSlider playAction={playAction} duration={duration} currentTime={currentTime} seekSetTime={seekSetTime} />
        <TimeBlock duration={duration} currentTime={currentTime} />
        <ControlButton icon={muted ? 'mute' : 'sound'} label={muted ? 'Unmute' : 'Mute'} onClick={() => onMutedChange(!muted)} />
        <ControlButton icon="fullscreen" label="Fullscreen" onClick={fullScreenAction} />
      </div>
    </VideoPlayerControlStyles>
  );
};
