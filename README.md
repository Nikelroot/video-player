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
# video-player
