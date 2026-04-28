import type { HlsConfig } from 'hls.js';

export const confVod: Partial<HlsConfig> = {
  autoStartLoad: true,
  enableWorker: true,
  capLevelToPlayerSize: true,
  appendErrorMaxRetry: 5,
  maxBufferLength: 45,
  maxMaxBufferLength: 90,
  maxBufferHole: 0.3,
  backBufferLength: 20,
  fragLoadPolicy: {
    default: {
      maxTimeToFirstByteMs: 12000,
      maxLoadTimeMs: 20000,
      timeoutRetry: { maxNumRetry: 2, retryDelayMs: 500, maxRetryDelayMs: 2000 },
      errorRetry: { maxNumRetry: 2, retryDelayMs: 500, maxRetryDelayMs: 2000 },
    },
  },
};

export const confLiveStability: Partial<HlsConfig> = {
  autoStartLoad: true,
  enableWorker: true,
  capLevelToPlayerSize: true,
  lowLatencyMode: false,
  liveSyncDuration: 7,
  liveMaxLatencyDuration: 14,
  maxBufferLength: 30,
  backBufferLength: 20,
  fragLoadPolicy: {
    default: {
      maxTimeToFirstByteMs: 15000,
      maxLoadTimeMs: 25000,
      timeoutRetry: { maxNumRetry: 3, retryDelayMs: 500, maxRetryDelayMs: 2500 },
      errorRetry: { maxNumRetry: 3, retryDelayMs: 500, maxRetryDelayMs: 2500 },
    },
  },
  debug: false,
};

export const withCredentialsConfig = (
  config: Partial<HlsConfig>,
  credentials: RequestCredentials | undefined
): Partial<HlsConfig> => {
  if (!credentials || credentials === 'same-origin') return config;

  return {
    ...config,
    xhrSetup: (xhr, url) => {
      xhr.withCredentials = credentials === 'include';
      config.xhrSetup?.(xhr, url);
    },
    fetchSetup: (context, initParams) => {
      const request = new Request(context.url, {
        ...initParams,
        credentials,
      });

      return config.fetchSetup?.(context, initParams) || request;
    },
  };
};
