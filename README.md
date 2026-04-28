# @nikelroot/video-player

Standalone React video player with HLS support, retry/recovery behavior, fullscreen, seek controls, and overridable error messages.

## Install

```bash
npm install @nikelroot/video-player
```

Peer dependencies:

```bash
npm install react react-dom styled-components
```

## Usage

```tsx
import { useRef } from 'react';
import VideoPlayer from '@nikelroot/video-player';

export function Example() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <VideoPlayer
      videoRef={videoRef}
      videoSrc="https://example.com/stream.m3u8"
      controlsVariant="full"
      active={true}
      live={false}
      autoPlay={false}
      onTimeChange={(time) => console.log(time)}
    />
  );
}
```

When `active` is `true`, pressing `F` toggles fullscreen.

Build before publishing:

```bash
npm run build
```
# video-player
