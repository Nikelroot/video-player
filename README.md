# @nikelroot/video-player

Standalone React video player with HLS support, retry/recovery behavior, fullscreen, seek controls, and overridable error messages.

## Install

```bash
npm install @nikelroot/video-player
```

## GitLab CI and automatic npm releases

The repository is hosted at https://gitlab.nikelroot.ru/home/nvideoplayer.
Every push to the default branch runs validation and publishes a new public
version of `@nikelroot/video-player` to npmjs.com. Merge requests and other
branches only run validation. Tag pipelines are disabled.

The release chooses the highest stable version from `package.json` and npm,
then increases its patch number (for example, `0.3.2` → `0.3.3`). It commits
`package.json` and `package-lock.json`, creates `v<version>`, and pushes both
atomically before publishing. The bot commit contains `[skip ci]` to avoid
a release loop. Releases are serialized; pipelines for outdated commits skip
publication. To recover from an npm failure, retry the failed `publish` job
before pushing new changes: it reuses the saved version. If the version has
already been published, the retry completes without publishing again.

One-time setup in GitLab:

1. Configure a Docker-compatible runner capable of using `node:24-bookworm`.
2. Protect the default branch (usually `main`).
3. In **Settings → CI/CD → Variables**, add these **Masked** and **Protected**
   variables with variable expansion disabled:
   - `NPM_TOKEN`: an npm granular access token with read/write permission for
     `@nikelroot/video-player` and **Bypass two-factor authentication** enabled.
     The package publishing settings must permit token publishing. Renew the
     token before its expiration.
   - `GITLAB_PUSH_TOKEN`: a project access token with `write_repository` scope
     and a role allowed to push to the protected default branch and release
     tags. A personal access token with equivalent permissions also works.
4. Ensure branch/tag protection permits the token owner to push to the default
   branch and create `v*` tags.
5. Push the repository and CI configuration to GitLab. Do not add secrets to Git.

This self-hosted GitLab uses token authentication because npm trusted publishing
currently supports GitLab.com shared runners only. See the
[npm CI token guide](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow/)
and [trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/).

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
      videoSrc="https://example.com/stream.m3u8"
      videoRef={videoRef}
      active={true}
      live={false}
      autoPlay={false}
      onTimeChange={(time) => console.log(time)}
    />
  );
}
```

Only `videoSrc` is required. `controlsVariant` defaults to `"none"`; set it to `"full"`, `"fullscreen-only"`, or `"tiny"` to render built-in controls.

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

## Separate audio and video recordings

Provide the HLS master as `videoSrc`, the video media playlist as `videoOnlySrc`,
and available audio intervals in seconds on the same recording timeline:

```tsx
<VideoPlayer
  videoSrc="https://cdn.example.com/record/master.m3u8"
  videoOnlySrc="https://cdn.example.com/record/video.m3u8"
  audioRanges={[{ start: 0, end: 120 }, { start: 135, end: 240 }]}
  onAudioFallbackChange={(videoOnly) => console.log({ videoOnly })}
/>
```

Missing audio switches playback to the video playlist while retaining position,
playing or paused state, speed, volume, and mute. Playback returns to the master
when the current position has at least four seconds of available audio. Audio
request failures impose a 15-second retry cooldown. Update `audioRanges` as a
live recording grows; callbacks and metadata updates do not reload the source.
The player displays a nonblocking status while playing without audio.
Both media playlists and their fragment timestamps must use the same timeline.
