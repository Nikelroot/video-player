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

## Multiple MP4 players

Use `active` when rendering several video players on the same page and only one of them should be ready for playback.

```tsx
<VideoPlayer
  videoSrc="https://cdn.example.com/video-a.mp4"
  sourceType="native"
  active={isSelected}
  preload="metadata"
/>
```

This solves a switching problem where previous MP4 players can keep large browser media requests open after another player starts. In Chrome DevTools this often appears as new video requests staying in a long `Pending` state, even when CDN, disk, and network throughput are healthy.

For native MP4 sources:

- `active={true}` allows playback and fullscreen.
- `active={false}` releases playback loading so inactive players do not keep competing media requests open.
- `preload="metadata"` still loads metadata for inactive native videos, so duration and basic media information can be available without starting playback loading.

By default `exclusivePlayback` is enabled. When a player starts playback, the previous active native MP4 player is paused and its media source is released, freeing the browser media request before the next video loads.

For public CDN-hosted videos, prefer non-credentialed requests unless the CDN is explicitly configured for cookies:

```tsx
<VideoPlayer
  videoSrc="https://cdn.example.com/stream.m3u8"
  hlsCredentials="same-origin"
  crossOrigin="anonymous"
/>
```

If you use `hlsCredentials="include"` or `crossOrigin="use-credentials"`, the CDN must allow credentialed CORS and should not forward `Cookie` into the cache key for public media.

Build before publishing:

```bash
npm run build
```
