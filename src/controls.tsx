'use client';

import type { MouseEvent, ReactNode, RefObject } from 'react';
import { Flex, Button, Slider, Typography } from 'antd';
import type { SliderSingleProps } from 'antd';
import {
  BackwardFilled,
  FastForwardFilled,
  FullscreenOutlined,
  MutedFilled,
  PauseOutlined,
  PlaySquareFilled,
  SoundFilled,
} from '@ant-design/icons';
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
  const formatter: NonNullable<SliderSingleProps['tooltip']>['formatter'] = (value) => {
    return formatTime(Number(value ?? 0));
  };

  const clickHandler = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeCurrentTime = Math.max(0, Math.min(Number.isFinite(currentTime) ? currentTime : 0, safeDuration || Infinity));

  return (
    <SeekSliderStyled onClick={clickHandler} className="seek-slider">
      <Slider
        onChange={seekSetTime}
        onChangeComplete={() => {
          void playAction();
        }}
        value={safeCurrentTime}
        tooltip={{ formatter }}
        max={safeDuration}
        keyboard={false}
      />
    </SeekSliderStyled>
  );
};

const TimeBlock = ({ duration, currentTime }: { duration: number; currentTime: number }) => {
  return (
    <Typography.Text style={{ color: '#fff', whiteSpace: 'nowrap' }}>
      {formatTime(currentTime)} / {formatTime(duration)}
    </Typography.Text>
  );
};

export interface VideoPlayerControlsProps {
  variant: ControlsVariant;
  fullScreenAction: () => void;
  showControl: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
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
    videoRef,
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
  if (!videoRef.current) return null;

  if (variant === 'tiny') {
    return (
      <VideoPlayerControlStyles $tiny $isMobile={isMobile} onClick={stopControlClick} $showControl={showControl}>
        <Flex gap="small" align="center" justify="space-between">
          <div className="full" />
          <SeekSlider playAction={playAction} duration={duration} currentTime={currentTime} seekSetTime={seekSetTime} />
        </Flex>
      </VideoPlayerControlStyles>
    );
  }

  if (variant === 'fullscreen-only') {
    return (
      <VideoPlayerControlStyles $isMobile={isMobile} onClick={stopControlClick} $showControl={showControl}>
        <Flex gap="small" align="center" justify="space-between">
          <div className="full" />
          <Button size="small" onClick={() => onMutedChange(!muted)} icon={muted ? <MutedFilled /> : <SoundFilled />} />
          <Button size="small" onClick={fullScreenAction} icon={<FullscreenOutlined />} />
        </Flex>
      </VideoPlayerControlStyles>
    );
  }

  return (
    <VideoPlayerControlStyles $isMobile={isMobile} onClick={stopControlClick} $showControl={showControl}>
      <Flex gap="small" align="center" justify="space-between">
        {playing ? (
          <Button size="small" onClick={() => pauseAction()} icon={<PauseOutlined />} />
        ) : (
          <Button size="small" onClick={() => playAction()} icon={<PlaySquareFilled />} />
        )}
        <Button size="small" onClick={() => seekPrevAction()} icon={<BackwardFilled />} />
        <Button size="small" onClick={() => seekNextAction()} icon={<FastForwardFilled />} />
        <Typography.Text ellipsis className="video-player-control-title">
          {title}
        </Typography.Text>
        <div className="full" />
        <SeekSlider playAction={playAction} duration={duration} currentTime={currentTime} seekSetTime={seekSetTime} />
        <TimeBlock duration={duration} currentTime={currentTime} />
        <Button size="small" onClick={() => onMutedChange(!muted)} icon={muted ? <MutedFilled /> : <SoundFilled />} />
        <Button size="small" onClick={fullScreenAction} icon={<FullscreenOutlined />} />
      </Flex>
    </VideoPlayerControlStyles>
  );
};
