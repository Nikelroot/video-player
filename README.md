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
import VideoPlayer from '@nikelroot/video-player';

export function Example() {
  return (
    <VideoPlayer
      videoSrc="https://example.com/stream.m3u8"
      controlsVariant="full"
      live={false}
      autoPlay={false}
      onTimeChange={(time) => console.log(time)}
    />
  );
}
```

Build before publishing:

```bash
npm run build
```
# video-player
