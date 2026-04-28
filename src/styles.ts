import styled, { css } from 'styled-components';

export const VideoPlayerControlStyles = styled.div<{
  $isMobile?: boolean;
  $showControl: boolean;
  $tiny?: boolean;
}>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 5px;
  color: #fff;
  z-index: 1000;

  ${(props) =>
    props.$showControl &&
    css`
      background: rgba(0, 0, 0, 0.5);
    `};

  .full {
    flex: 1 auto;
  }

  .video-player-control-title {
    color: #fff;
    max-width: 40%;
  }

  ${(props) =>
    !props.$showControl &&
    css`
      .ant-flex {
        > * {
          opacity: 0;
          display: none;
        }
        > .seek-slider {
          opacity: 1;
          display: block;
          top: 2px;
        }
      }
    `};

  ${(props) =>
    props.$tiny &&
    css`
      padding: 0;
    `};
`;

export const VideoPlayerStyles = styled.div<{
  type?: string;
  $isMobile?: boolean | undefined;
  $mobileType?: string;
  $showControl?: boolean;
  $alwaysShowSegments?: boolean;
  $color?: string;
}>`
  position: relative;
  aspect-ratio: 16 / 9;
  max-height: 100%;
  max-width: 100vw;
  background: #000;

  ${(props) =>
    props.$color &&
    css`
      box-shadow: 0 0 5px 1px ${props.$color};
    `};

  &,
  * {
    user-select: none;
  }

  ${(props) =>
    props.$isMobile &&
    css`
      max-width: 100vw;
      min-height: auto !important;
    `};

  video {
    display: block;
    max-width: 100%;
    width: 100%;
    max-height: 100%;
  }

  .video-wrapper {
    position: relative;
    z-index: 10;
    transition: all 0.25s ease-in-out;
    max-height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .video-error-overlay {
    position: absolute;
    inset: 0;
    z-index: 13;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.72);
  }

  .video-error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    max-width: 320px;
    text-align: center;
    color: #fff;
  }

  .video-error-title {
    font-size: 14px;
    line-height: 1.4;
  }

  .video-error-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    font-size: 12px;
    line-height: 1.45;
    text-align: left;
    word-break: break-word;
  }

  .video-error-detail {
    opacity: 0.92;
  }

  .video-error-retry {
    border: 0;
    border-radius: 999px;
    padding: 8px 14px;
    background: #fff;
    color: #000;
    font-size: 13px;
    cursor: pointer;
  }

  ${(props) =>
    props.type === 'torrent' &&
    css`
      width: 100%;
      video {
        width: 100%;
      }
    `};

  .video-top-bar {
    padding: 5px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 11;
  }

  .video-right-bar {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 12;
    display: flex;
    align-items: stretch;
    pointer-events: auto;
    margin-top: 32px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.01);
    max-width: 380px;
    color: #fff;
    transition: all ease-in-out 0.25s;
    opacity: 0.01;
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.1);
      opacity: 1;
    }

    .video-right-bar-toggle {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-size: 12px;
      width: 20px;
      cursor: pointer;
      display: none !important;
    }

    .video-right-bar-content {
      display: block;
    }
  }

  ${(props) =>
    (props.$showControl || props.$alwaysShowSegments) &&
    css`
      .video-right-bar {
        background: rgba(0, 0, 0, 0.1);
        opacity: 1;
      }
    `};
`;

export const SeekSliderStyled = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: -12px;

  .ant-slider-rail {
    height: 20px;
    top: auto;
    bottom: 0;
    background: transparent !important;
  }

  .ant-slider {
    &:hover {
      .ant-slider-rail {
        background: transparent !important;
      }
    }
  }

  .ant-slider-track {
    top: 6px;
  }

  .ant-slider-handle {
    top: 3px;
  }

  .ant-slider-step {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
  }

  .ant-slider {
    margin: 0;
  }
`;
