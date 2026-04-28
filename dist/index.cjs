"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  VideoPlayer: () => VideoPlayer,
  default: () => VideoPlayer_default,
  hasNativeHlsSupport: () => hasNativeHlsSupport
});
module.exports = __toCommonJS(index_exports);

// src/VideoPlayer.tsx
var import_react3 = require("react");

// src/controls.tsx
var import_react2 = require("react");

// src/styles.ts
var import_styled_components = require("styled-components");
var VideoPlayerControlStyles = import_styled_components.styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 5px;
  color: #fff;
  z-index: 1000;

  ${(props) => props.$showControl && import_styled_components.css`
      background: rgba(0, 0, 0, 0.5);
    `};

  .full {
    flex: 1 auto;
  }

  .video-player-control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 30px;
  }

  .video-player-control-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    cursor: pointer;
    padding: 0;
  }

  .video-player-control-button:hover,
  .video-player-control-button:focus-visible {
    background: rgba(255, 255, 255, 0.22);
    outline: none;
  }

  .video-player-control-button:disabled {
    opacity: 0.42;
    cursor: not-allowed;
  }

  .video-player-control-button:disabled:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .video-player-icon {
    width: 17px;
    height: 17px;
    fill: currentColor;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .video-player-control-title {
    color: #fff;
    max-width: 40%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .video-player-time {
    color: #fff;
    white-space: nowrap;
    font-size: 14px;
  }

  ${(props) => !props.$showControl && import_styled_components.css`
      .video-player-control-row {
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

  ${(props) => props.$tiny && import_styled_components.css`
      padding: 0;
    `};
`;
var VideoPlayerStyles = import_styled_components.styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  max-height: 100%;
  max-width: 100vw;
  background: #000;

  ${(props) => props.$color && import_styled_components.css`
      box-shadow: 0 0 5px 1px ${props.$color};
    `};

  &,
  * {
    user-select: none;
  }

  ${(props) => props.$isMobile && import_styled_components.css`
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

  ${(props) => props.type === "torrent" && import_styled_components.css`
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

  &:hover {
    .video-right-bar {
      background: rgba(0, 0, 0, 0.1);
      opacity: 1;
    }
  }

  ${(props) => (props.$showControl || props.$alwaysShowSegments) && import_styled_components.css`
      .video-right-bar {
        background: rgba(0, 0, 0, 0.1);
        opacity: 1;
      }
    `};
`;
var SeekSliderStyled = import_styled_components.styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: -12px;

  .seek-range {
    display: block;
    width: 100%;
    height: 20px;
    margin: 0;
    accent-color: #fff;
    background: transparent;
    cursor: pointer;
  }

  .seek-range:disabled {
    cursor: default;
    opacity: 0.65;
  }
`;

// src/utils.ts
var import_react = require("react");
var formatTime = (seconds) => {
  const totalSeconds = Number.parseInt(String(seconds), 10);
  const safeSeconds = Number.isFinite(totalSeconds) ? totalSeconds : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor(safeSeconds % 3600 / 60);
  const secs = safeSeconds % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0")
  ].join(":");
};
var widthSnapshot = 0;
var resizeRafId = null;
var isListening = false;
var listeners = /* @__PURE__ */ new Set();
var notifyAll = () => {
  listeners.forEach((listener) => listener());
};
var resizeHandler = () => {
  if (typeof window === "undefined") return;
  const nextWidth = window.innerWidth;
  if (resizeRafId != null) cancelAnimationFrame(resizeRafId);
  resizeRafId = requestAnimationFrame(() => {
    if (widthSnapshot === nextWidth) return;
    widthSnapshot = nextWidth;
    notifyAll();
  });
};
var startListening = () => {
  if (typeof window === "undefined" || isListening) return;
  isListening = true;
  widthSnapshot = window.innerWidth;
  window.addEventListener("resize", resizeHandler, { passive: true });
};
var stopListening = () => {
  if (typeof window === "undefined" || !isListening || listeners.size > 0) return;
  window.removeEventListener("resize", resizeHandler);
  if (resizeRafId != null) {
    cancelAnimationFrame(resizeRafId);
    resizeRafId = null;
  }
  isListening = false;
};
var subscribe = (listener) => {
  listeners.add(listener);
  startListening();
  return () => {
    listeners.delete(listener);
    stopListening();
  };
};
var getSnapshot = () => {
  if (typeof window !== "undefined" && !isListening) {
    widthSnapshot = window.innerWidth;
  }
  return widthSnapshot;
};
var getServerSnapshot = () => 0;
function useWindowWidth(mobileLimit = 768) {
  const width = (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getServerSnapshot);
  const isMobile = width <= mobileLimit;
  const mobileType = (0, import_react.useMemo)(() => {
    if (width <= mobileLimit) return "mobile";
    if (width <= 1024) return "laptop";
    return "default";
  }, [width, mobileLimit]);
  return [width, isMobile, mobileType];
}
var createThrottledNumberFn = (fn, waitMs) => {
  let timer = null;
  let lastCall = 0;
  let pendingValue = null;
  const throttled = ((value) => {
    const now = Date.now();
    const elapsed = now - lastCall;
    if (elapsed >= waitMs) {
      lastCall = now;
      fn(value);
      return;
    }
    pendingValue = value;
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      lastCall = Date.now();
      if (pendingValue != null) {
        fn(pendingValue);
        pendingValue = null;
      }
    }, waitMs - elapsed);
  });
  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    pendingValue = null;
  };
  return throttled;
};

// src/controls.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var SeekSlider = ({ playAction, duration, currentTime, seekSetTime }) => {
  const ref = (0, import_react2.useRef)(null);
  const clickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeCurrentTime = Math.max(0, Math.min(Number.isFinite(currentTime) ? currentTime : 0, safeDuration || Infinity));
  const completeChange = () => {
    void playAction();
    if (ref.current) {
      ref.current.blur();
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeekSliderStyled, { onClick: clickHandler, className: "seek-slider", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "input",
    {
      ref,
      "aria-label": "Seek",
      className: "seek-range",
      disabled: safeDuration <= 0,
      max: safeDuration,
      min: 0,
      onChange: (e) => seekSetTime(Number(e.currentTarget.value)),
      onKeyUp: (e) => {
        if (e.key === "Enter" || e.key === " ") completeChange();
      },
      onPointerUp: completeChange,
      step: "any",
      type: "range",
      value: safeCurrentTime,
      title: formatTime(safeCurrentTime)
    }
  ) });
};
var TimeBlock = ({ duration, currentTime }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "video-player-time", children: [
    formatTime(currentTime),
    " / ",
    formatTime(duration)
  ] });
};
var Icon = ({ name }) => {
  const paths = {
    back: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M11 7l-6 5 6 5V7z" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19 7l-6 5 6 5V7z" })
    ] }),
    forward: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5 7l6 5-6 5V7z" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M13 7l6 5-6 5V7z" })
    ] }),
    fullscreen: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5 10V5h5" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M14 5h5v5" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19 14v5h-5" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M10 19H5v-5" })
    ] }),
    mute: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4 10v4h4l5 4V6l-5 4H4z" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M17 9l4 6" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 9l-4 6" })
    ] }),
    pause: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 6h3v12H8z" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M13 6h3v12h-3z" })
    ] }),
    play: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 5v14l11-7L8 5z" }),
    sound: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4 10v4h4l5 4V6l-5 4H4z" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M16 9a4 4 0 010 6" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M18.5 6.5a8 8 0 010 11" })
    ] })
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { "aria-hidden": "true", className: "video-player-icon", focusable: "false", viewBox: "0 0 24 24", children: paths[name] });
};
var ControlButton = ({
  disabled,
  icon,
  label,
  onClick
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      "aria-label": label,
      className: "video-player-control-button",
      disabled,
      onClick: () => void onClick(),
      title: label,
      type: "button",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: icon })
    }
  );
};
var stopControlClick = (e) => {
  e.preventDefault();
  e.stopPropagation();
};
var VideoPlayerControls = (props) => {
  const {
    variant,
    fullScreenAction,
    fullscreenAllowed,
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
    title
  } = props;
  const [, isMobile] = useWindowWidth();
  if (variant === "none") return null;
  if (variant === "tiny") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoPlayerControlStyles, { $tiny: true, $isMobile: isMobile, onClick: stopControlClick, $showControl: showControl, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "video-player-control-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "full" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeekSlider, { playAction, duration, currentTime, seekSetTime })
    ] }) });
  }
  if (variant === "fullscreen-only") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoPlayerControlStyles, { $isMobile: isMobile, onClick: stopControlClick, $showControl: showControl, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "video-player-control-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "full" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlButton, { icon: muted ? "mute" : "sound", label: muted ? "Unmute" : "Mute", onClick: () => onMutedChange(!muted) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlButton, { disabled: !fullscreenAllowed, icon: "fullscreen", label: "Fullscreen", onClick: fullScreenAction })
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoPlayerControlStyles, { $isMobile: isMobile, onClick: stopControlClick, $showControl: showControl, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "video-player-control-row", children: [
    playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlButton, { icon: "pause", label: "Pause", onClick: pauseAction }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlButton, { icon: "play", label: "Play", onClick: playAction }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlButton, { icon: "back", label: "Back 15 seconds", onClick: () => seekPrevAction() }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlButton, { icon: "forward", label: "Forward 15 seconds", onClick: () => seekNextAction() }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "video-player-control-title", title: typeof title === "string" ? title : void 0, children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "full" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeekSlider, { playAction, duration, currentTime, seekSetTime }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimeBlock, { duration, currentTime }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlButton, { icon: muted ? "mute" : "sound", label: muted ? "Unmute" : "Mute", onClick: () => onMutedChange(!muted) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlButton, { disabled: !fullscreenAllowed, icon: "fullscreen", label: "Fullscreen", onClick: fullScreenAction })
  ] }) });
};

// src/configs.ts
var confVod = {
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
      maxTimeToFirstByteMs: 12e3,
      maxLoadTimeMs: 2e4,
      timeoutRetry: { maxNumRetry: 2, retryDelayMs: 500, maxRetryDelayMs: 2e3 },
      errorRetry: { maxNumRetry: 2, retryDelayMs: 500, maxRetryDelayMs: 2e3 }
    }
  }
};
var confLiveStability = {
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
      maxTimeToFirstByteMs: 15e3,
      maxLoadTimeMs: 25e3,
      timeoutRetry: { maxNumRetry: 3, retryDelayMs: 500, maxRetryDelayMs: 2500 },
      errorRetry: { maxNumRetry: 3, retryDelayMs: 500, maxRetryDelayMs: 2500 }
    }
  },
  debug: false
};
var withCredentialsConfig = (config, credentials) => {
  if (!credentials || credentials === "same-origin") return config;
  return {
    ...config,
    xhrSetup: (xhr, url) => {
      var _a;
      xhr.withCredentials = credentials === "include";
      (_a = config.xhrSetup) == null ? void 0 : _a.call(config, xhr, url);
    },
    fetchSetup: (context, initParams) => {
      var _a;
      const request = new Request(context.url, {
        ...initParams,
        credentials
      });
      return ((_a = config.fetchSetup) == null ? void 0 : _a.call(config, context, initParams)) || request;
    }
  };
};

// src/errorDetails.ts
var isRecord = (value) => typeof value === "object" && value !== null;
var asText = (value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
};
var getMediaErrorCodeLabel = (code) => {
  switch (code) {
    case 1:
      return "MEDIA_ERR_ABORTED";
    case 2:
      return "MEDIA_ERR_NETWORK";
    case 3:
      return "MEDIA_ERR_DECODE";
    case 4:
      return "MEDIA_ERR_SRC_NOT_SUPPORTED";
    default:
      return "MEDIA_ERR_UNKNOWN";
  }
};
var getPlaybackErrorCodeText = (error) => {
  if (!isRecord(error) || typeof error.code !== "number") return null;
  return `${getMediaErrorCodeLabel(error.code)} (${error.code})`;
};
var getResponseSummary = (response) => {
  if (!isRecord(response)) return null;
  const code = asText(response.code);
  const text = asText(response.text);
  if (code && text) return `${code} ${text}`;
  return code || text;
};
var getSource = (data) => {
  if (!isRecord(data)) return null;
  const directSource = asText(data.src) || asText(data.url);
  if (directSource) return directSource;
  const contextUrl = isRecord(data.context) ? asText(data.context.url) : null;
  if (contextUrl) return contextUrl;
  const fragUrl = isRecord(data.frag) ? asText(data.frag.url) : null;
  if (fragUrl) return fragUrl;
  const responseUrl = isRecord(data.response) ? asText(data.response.url) : null;
  return responseUrl;
};
var addDetail = (details, label, value) => {
  const text = asText(value);
  if (!text) return;
  const line = `${label}: ${text}`;
  if (!details.includes(line)) {
    details.push(line);
  }
};
var formatPlaybackErrorDetails = (error, data) => {
  const details = [];
  addDetail(details, "\u041A\u043E\u0434", getPlaybackErrorCodeText(error));
  if (error instanceof Error) {
    addDetail(details, "\u041E\u0448\u0438\u0431\u043A\u0430", error.message || error.name);
  } else if (typeof error === "string") {
    addDetail(details, "\u041E\u0448\u0438\u0431\u043A\u0430", error);
  }
  if (isRecord(data)) {
    addDetail(details, "\u0422\u0438\u043F", data.type);
    addDetail(details, "\u0414\u0435\u0442\u0430\u043B\u0438", data.details);
    addDetail(details, "\u041F\u0440\u0438\u0447\u0438\u043D\u0430", data.reason);
    addDetail(details, "HTTP", getResponseSummary(data.response));
    addDetail(details, "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A", getSource(data));
  }
  return details;
};

// src/VideoPlayer.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var defaultMessages = {
  defaultError: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0432\u0438\u0434\u0435\u043E",
  aborted: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0432\u0438\u0434\u0435\u043E \u0431\u044B\u043B\u0430 \u043F\u0440\u0435\u0440\u0432\u0430\u043D\u0430",
  network: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0442\u0438 \u043F\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 \u0432\u0438\u0434\u0435\u043E",
  decode: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0434\u0435\u043A\u043E\u0434\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0432\u0438\u0434\u0435\u043E",
  unsupported: "\u0424\u043E\u0440\u043C\u0430\u0442 \u0432\u0438\u0434\u0435\u043E \u043D\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044F",
  playFailed: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0447\u0430\u0442\u044C \u0432\u043E\u0441\u043F\u0440\u043E\u0438\u0437\u0432\u0435\u0434\u0435\u043D\u0438\u0435",
  streamLoadFailed: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0432\u0438\u0434\u0435\u043E\u043F\u043E\u0442\u043E\u043A\u0430",
  streamDecodeFailed: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0434\u0435\u043A\u043E\u0434\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0432\u0438\u0434\u0435\u043E\u043F\u043E\u0442\u043E\u043A",
  retry: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C"
};
var MAX_NET_RETRIES = 3;
var MAX_FATAL_RELOADS = 3;
var LIVE_STALL_WINDOW_MS = 2e4;
var LIVE_STALLS_BEFORE_STABILITY = 3;
var hlsCtorPromise = null;
var activeExclusiveVideo = null;
var loadHlsCtor = () => {
  if (!hlsCtorPromise) {
    hlsCtorPromise = import("hls.js").then((mod) => mod.default);
  }
  return hlsCtorPromise;
};
var isInterruptedPlayRequestError = (error) => {
  if (!(error instanceof Error)) return false;
  return error.name === "AbortError" || error.message.includes("The play() request was interrupted by a new load request") || error.message.includes("The play() request was interrupted");
};
var canAttemptPlayback = (video) => {
  return !!video && video.readyState >= HTMLMediaElement.HAVE_METADATA;
};
function hasNativeHlsSupport() {
  if (typeof navigator === "undefined" || typeof document === "undefined") return false;
  const isSafari = /^((?!chrome|android|firefox|opera|edg).)*safari/i.test(navigator.userAgent);
  if (!isSafari) return false;
  const video = document.createElement("video");
  const mimes = ["application/vnd.apple.mpegurl", "application/x-mpegURL"];
  return mimes.some((t) => {
    const r = video.canPlayType(t);
    return r === "probably" || r === "maybe";
  });
}
var getNativeVideoErrorMessage = (error, messages) => {
  if (!error) return messages.defaultError;
  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return messages.aborted;
    case MediaError.MEDIA_ERR_NETWORK:
      return messages.network;
    case MediaError.MEDIA_ERR_DECODE:
      return messages.decode;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return messages.unsupported;
    default:
      return messages.defaultError;
  }
};
var clampTime = (time, duration) => {
  const safeTime = Number.isFinite(time) ? time : 0;
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  return safeDuration > 0 ? Math.max(0, Math.min(safeTime, safeDuration)) : Math.max(0, safeTime);
};
var isLikelyHlsSource = (src) => {
  try {
    const url = new URL(src, "http://video-player.local");
    return /\.m3u8$/i.test(url.pathname) || /\.m3u8($|[?#])/i.test(src);
  } catch {
    return /\.m3u8($|[?#])/i.test(src);
  }
};
var assignRef = (ref, value) => {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  ref.current = value;
};
var isEditableKeyTarget = (target) => {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
};
var VideoPlayerBase = (props, ref) => {
  const {
    controlsVariant = "none",
    active,
    autoPlay = false,
    preload = "metadata",
    loop = false,
    type,
    sourceType = "auto",
    onVideoClick,
    onVideoDoubleClick,
    playOnClick = true,
    live = false,
    videoTopBar: VideoTopBar,
    videoRightBar: VideoRightBar,
    defaultPlaying = false,
    playing: playingProp,
    poster,
    alwaysShowSegments = false,
    initialTime = 0,
    reloadKey,
    videoRef: externalVideoRef,
    onVideoRefChange,
    handleClick = true,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    exclusivePlayback = true,
    onMutedChange,
    onPlayingChange,
    onTimeChange,
    onDurationChange,
    onActiveChange,
    onPlaybackError,
    title,
    scrollTo = true,
    muted: mutedProp,
    defaultMuted = false,
    currentTime: currentTimeProp,
    duration: durationProp,
    hlsConfig,
    vodHlsConfig,
    liveHlsConfig,
    hlsCredentials = "include",
    crossOrigin = "use-credentials",
    messages: messagesProp,
    accentColor,
    videoSrc: rawVideoSrc = "",
    ...videoProps
  } = props;
  const videoSrc = rawVideoSrc.replaceAll(" ", "%20").replaceAll("#", "%23");
  const messages = (0, import_react3.useMemo)(() => ({ ...defaultMessages, ...messagesProp }), [messagesProp]);
  const [, isMobile, mobileType] = useWindowWidth();
  const videoRef = (0, import_react3.useRef)(null);
  const hlsRef = (0, import_react3.useRef)(null);
  const containerRef = (0, import_react3.useRef)(null);
  const netRetryCount = (0, import_react3.useRef)(0);
  const mediaRecoverCount = (0, import_react3.useRef)(0);
  const fatalReloadCount = (0, import_react3.useRef)(0);
  const reloadTimer = (0, import_react3.useRef)(null);
  const stalledNudgeTimer = (0, import_react3.useRef)(null);
  const liveStabilityMode = (0, import_react3.useRef)(false);
  const liveStallEvents = (0, import_react3.useRef)([]);
  const controlTime = (0, import_react3.useRef)(null);
  const sourceLoadId = (0, import_react3.useRef)(0);
  const [playingState, setPlayingState] = (0, import_react3.useState)(!!defaultPlaying);
  const [mutedState, setMutedState] = (0, import_react3.useState)(!!defaultMuted);
  const [durationState, setDurationState] = (0, import_react3.useState)(0);
  const [currentTimeState, setCurrentTimeState] = (0, import_react3.useState)(0);
  const [isFullscreen, setIsFullscreen] = (0, import_react3.useState)(false);
  const [showControl, setControlVisible] = (0, import_react3.useState)(true);
  const [errorState, setErrorState] = (0, import_react3.useState)(null);
  const [reloadToken, setReloadToken] = (0, import_react3.useState)(0);
  const playing = playingProp != null ? playingProp : playingState;
  const muted = mutedProp != null ? mutedProp : mutedState;
  const isDurationControlled = durationProp !== void 0;
  const isCurrentTimeControlled = currentTimeProp !== void 0;
  const duration = durationProp != null ? durationProp : durationState;
  const currentTime = currentTimeProp != null ? currentTimeProp : currentTimeState;
  const fullscreenAllowed = active != null ? active : true;
  const onTimeChangeRef = (0, import_react3.useRef)(onTimeChange);
  const onDurationChangeRef = (0, import_react3.useRef)(onDurationChange);
  onTimeChangeRef.current = onTimeChange;
  onDurationChangeRef.current = onDurationChange;
  const setTimeD = (0, import_react3.useRef)(
    createThrottledNumberFn((value) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = value;
    }, 30)
  );
  const clearTimers = (0, import_react3.useCallback)(() => {
    if (reloadTimer.current) {
      clearTimeout(reloadTimer.current);
      reloadTimer.current = null;
    }
    if (stalledNudgeTimer.current) {
      clearTimeout(stalledNudgeTimer.current);
      stalledNudgeTimer.current = null;
    }
    if (controlTime.current) {
      clearTimeout(controlTime.current);
      controlTime.current = null;
    }
  }, []);
  const resetMediaForSourceChange = (0, import_react3.useCallback)(() => {
    clearTimers();
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
  }, [clearTimers]);
  const setNextPlaying = (0, import_react3.useCallback)(
    (value) => {
      if (playingProp === void 0) setPlayingState(value);
      onPlayingChange == null ? void 0 : onPlayingChange(value);
    },
    [onPlayingChange, playingProp]
  );
  const setNextMuted = (0, import_react3.useCallback)(
    (value) => {
      if (mutedProp === void 0) setMutedState(value);
      const el = videoRef.current;
      if (el) el.muted = value;
      onMutedChange == null ? void 0 : onMutedChange(value);
    },
    [mutedProp, onMutedChange]
  );
  const clearErrorState = (0, import_react3.useCallback)(() => {
    setErrorState((prev) => prev ? null : prev);
  }, []);
  const reportError = (0, import_react3.useCallback)(
    (error, data, message = messages.defaultError) => {
      const details = formatPlaybackErrorDetails(error, data);
      const code = getPlaybackErrorCodeText(error);
      setNextPlaying(false);
      setErrorState({ message, error, data, details });
      console.error("[VideoPlayer] playback error", {
        message,
        code,
        details,
        error,
        data
      });
      onPlaybackError == null ? void 0 : onPlaybackError({ error, data, message, details });
    },
    [messages.defaultError, onPlaybackError, setNextPlaying]
  );
  const notifyActiveChange = (0, import_react3.useCallback)(
    (video, reason) => {
      onActiveChange == null ? void 0 : onActiveChange({ video, reason });
    },
    [onActiveChange]
  );
  const onTime = (0, import_react3.useCallback)(() => {
    var _a;
    const el = videoRef.current;
    if (!el) return;
    const nextTime = Number.isFinite(el.currentTime) ? el.currentTime : 0;
    if (!isCurrentTimeControlled) setCurrentTimeState(nextTime);
    (_a = onTimeChangeRef.current) == null ? void 0 : _a.call(onTimeChangeRef, nextTime, el);
  }, [isCurrentTimeControlled]);
  const onDur = (0, import_react3.useCallback)(() => {
    var _a;
    const el = videoRef.current;
    if (!el) return;
    const nextDuration = Number.isFinite(el.duration) ? el.duration : 0;
    if (!isDurationControlled) setDurationState(nextDuration);
    (_a = onDurationChangeRef.current) == null ? void 0 : _a.call(onDurationChangeRef, nextDuration, el);
  }, [isDurationControlled]);
  const setVideoEl = (0, import_react3.useCallback)(
    (el) => {
      const prev = videoRef.current;
      if (prev === el) return;
      if (prev) {
        prev.removeEventListener("timeupdate", onTime);
        prev.removeEventListener("durationchange", onDur);
      }
      videoRef.current = el;
      assignRef(externalVideoRef, el);
      onVideoRefChange == null ? void 0 : onVideoRefChange(el);
      notifyActiveChange(el, "ref");
      if (!el) return;
      el.muted = muted;
      el.addEventListener("timeupdate", onTime);
      el.addEventListener("durationchange", onDur);
    },
    [externalVideoRef, muted, notifyActiveChange, onDur, onTime, onVideoRefChange]
  );
  const pauseOtherVideos = (0, import_react3.useCallback)(
    (el) => {
      if (!exclusivePlayback) return;
      if (typeof exclusivePlayback === "object") {
        exclusivePlayback.pauseOthers(el);
        return;
      }
      if (activeExclusiveVideo && activeExclusiveVideo !== el && !activeExclusiveVideo.paused) {
        activeExclusiveVideo.pause();
      }
      activeExclusiveVideo = el;
    },
    [exclusivePlayback]
  );
  const playAction = (0, import_react3.useCallback)(async () => {
    const el = videoRef.current;
    if (!el) return;
    pauseOtherVideos(el);
    try {
      await el.play();
      clearErrorState();
      setNextPlaying(true);
      notifyActiveChange(el, "play");
    } catch (e) {
      if (isInterruptedPlayRequestError(e)) return;
      console.debug(e);
      reportError(e, { type: "play" }, messages.playFailed);
    }
    if (scrollTo === true) {
      const rect = el.getBoundingClientRect();
      const inViewport = rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
      if (!inViewport) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });
      }
    }
  }, [clearErrorState, messages.playFailed, notifyActiveChange, pauseOtherVideos, reportError, scrollTo, setNextPlaying]);
  const pauseAction = (0, import_react3.useCallback)(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    setNextPlaying(false);
    notifyActiveChange(el, "pause");
  }, [notifyActiveChange, setNextPlaying]);
  const seekSetTime = (0, import_react3.useCallback)(
    (value) => {
      const el = videoRef.current;
      if (!el) return;
      const next = clampTime(value, duration);
      setTimeD.current(next);
      if (currentTimeProp === void 0) setCurrentTimeState(next);
      notifyActiveChange(el, "seek");
    },
    [currentTimeProp, duration, notifyActiveChange]
  );
  const seekPrevAction = (0, import_react3.useCallback)(
    (sec = 15) => {
      const el = videoRef.current;
      if (!el) return;
      seekSetTime(el.currentTime - sec);
    },
    [seekSetTime]
  );
  const seekNextAction = (0, import_react3.useCallback)(
    (sec = 15) => {
      const el = videoRef.current;
      if (!el) return;
      seekSetTime(el.currentTime + sec);
    },
    [seekSetTime]
  );
  const toggleAction = (0, import_react3.useCallback)(
    (force) => {
      const el = videoRef.current;
      if (!el) return;
      if (force || el.paused) {
        void playAction();
      } else {
        pauseAction();
      }
    },
    [pauseAction, playAction]
  );
  const nudgeOnStall = (0, import_react3.useCallback)(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, v.currentTime + 0.05);
  }, []);
  const shouldSwitchLiveToStability = (0, import_react3.useCallback)(() => {
    if (!live || liveStabilityMode.current) return false;
    const now = Date.now();
    liveStallEvents.current = [...liveStallEvents.current.filter((ts) => now - ts <= LIVE_STALL_WINDOW_MS), now];
    if (liveStallEvents.current.length < LIVE_STALLS_BEFORE_STABILITY) return false;
    liveStabilityMode.current = true;
    liveStallEvents.current = [];
    return true;
  }, [live]);
  const resolvedHlsConfig = (0, import_react3.useCallback)(() => {
    const modeConfig = live ? liveHlsConfig : vodHlsConfig;
    const base = live ? confLiveStability : confVod;
    return withCredentialsConfig(
      {
        ...base,
        ...hlsConfig,
        ...modeConfig
      },
      hlsCredentials
    );
  }, [hlsConfig, hlsCredentials, live, liveHlsConfig, vodHlsConfig]);
  const loadVideo = (0, import_react3.useCallback)(
    async (startAt = initialTime, loadId = sourceLoadId.current) => {
      const startVideoRef = videoRef.current;
      if (!startVideoRef) return;
      let HlsCtor;
      try {
        HlsCtor = await loadHlsCtor();
      } catch (error) {
        reportError(error, { type: "hls-loader", src: videoSrc }, messages.streamLoadFailed);
        return;
      }
      if (loadId !== sourceLoadId.current) return;
      if (!videoRef.current || videoRef.current !== startVideoRef) return;
      const video = videoRef.current;
      if (!video) return;
      const h = new HlsCtor(resolvedHlsConfig());
      hlsRef.current = h;
      const isStaleLoad = () => loadId !== sourceLoadId.current || hlsRef.current !== h || videoRef.current !== video;
      h.on(HlsCtor.Events.ERROR, (_evt, data) => {
        var _a, _b;
        if (isStaleLoad()) return;
        const { type: errorType, details, fatal } = data;
        if (details === HlsCtor.ErrorDetails.BUFFER_APPEND_ERROR || details === "bufferAppendingError") return;
        if (!fatal) {
          switch (details) {
            case HlsCtor.ErrorDetails.BUFFER_STALLED_ERROR:
            case HlsCtor.ErrorDetails.BUFFER_NUDGE_ON_STALL:
              if (!stalledNudgeTimer.current) {
                stalledNudgeTimer.current = setTimeout(() => {
                  stalledNudgeTimer.current = null;
                  nudgeOnStall();
                }, 200);
              }
              if (shouldSwitchLiveToStability()) {
                const resumeTime2 = ((_a = videoRef.current) == null ? void 0 : _a.currentTime) || 0;
                clearTimers();
                reloadTimer.current = setTimeout(() => {
                  if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                  }
                  void loadVideo(resumeTime2, loadId);
                }, 250);
              }
              return;
            default:
              return;
          }
        }
        const resumeTime = ((_b = videoRef.current) == null ? void 0 : _b.currentTime) || 0;
        if (errorType === HlsCtor.ErrorTypes.NETWORK_ERROR) {
          if (netRetryCount.current < MAX_NET_RETRIES) {
            netRetryCount.current += 1;
            const backoffMs = 400 * Math.pow(2, netRetryCount.current - 1);
            clearErrorState();
            clearTimers();
            reloadTimer.current = setTimeout(() => {
              if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
              }
              void loadVideo(resumeTime, loadId);
            }, backoffMs);
            return;
          }
          h.destroy();
          if (hlsRef.current === h) {
            hlsRef.current = null;
          }
          reportError(details, data, messages.streamLoadFailed);
          return;
        }
        if (errorType === HlsCtor.ErrorTypes.MEDIA_ERROR) {
          if (mediaRecoverCount.current === 0) {
            mediaRecoverCount.current = 1;
            clearErrorState();
            h.recoverMediaError();
            return;
          }
          if (mediaRecoverCount.current === 1) {
            mediaRecoverCount.current = 2;
            clearErrorState();
            h.swapAudioCodec();
            h.recoverMediaError();
            return;
          }
        }
        if (fatalReloadCount.current >= MAX_FATAL_RELOADS) {
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
          reportError(
            details,
            data,
            errorType === HlsCtor.ErrorTypes.MEDIA_ERROR ? messages.streamDecodeFailed : messages.streamLoadFailed
          );
          return;
        }
        fatalReloadCount.current += 1;
        clearErrorState();
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        void loadVideo(resumeTime, loadId);
      });
      h.on(HlsCtor.Events.MEDIA_ATTACHED, () => {
        if (isStaleLoad()) return;
        h.loadSource(videoSrc);
      });
      h.on(HlsCtor.Events.MANIFEST_PARSED, () => {
        if (isStaleLoad()) return;
        fatalReloadCount.current = 0;
        netRetryCount.current = 0;
        mediaRecoverCount.current = 0;
        if (!live && startAt > 0) {
          h.startLoad(startAt);
          video.currentTime = startAt;
        } else {
          h.startLoad();
        }
        if (autoPlay) void playAction();
      });
      h.attachMedia(video);
    },
    [
      autoPlay,
      clearErrorState,
      clearTimers,
      initialTime,
      live,
      messages.streamDecodeFailed,
      messages.streamLoadFailed,
      nudgeOnStall,
      playAction,
      reportError,
      resolvedHlsConfig,
      shouldSwitchLiveToStability,
      videoSrc
    ]
  );
  const loadVideoNative = (0, import_react3.useCallback)((loadId = sourceLoadId.current) => {
    if (loadId !== sourceLoadId.current) return;
    const video = videoRef.current;
    if (!video) return;
    video.src = videoSrc;
    video.currentTime = initialTime;
    if (autoPlay) void playAction();
  }, [autoPlay, initialTime, playAction, videoSrc]);
  const loadVideoHls = (0, import_react3.useCallback)(async (loadId = sourceLoadId.current) => {
    const video = videoRef.current;
    const canNativeHls = !!(video == null ? void 0 : video.canPlayType) && video.canPlayType("application/vnd.apple.mpegurl") !== "";
    let HlsCtor;
    try {
      HlsCtor = await loadHlsCtor();
    } catch (error) {
      reportError(error, { type: "hls-loader", src: videoSrc }, messages.streamLoadFailed);
      return;
    }
    if (loadId !== sourceLoadId.current) return;
    if (!videoRef.current || videoRef.current !== video) return;
    if (HlsCtor.isSupported()) {
      void loadVideo(initialTime, loadId);
      return;
    }
    if (canNativeHls) {
      loadVideoNative(loadId);
      return;
    }
    reportError(null, { type: "hls", src: videoSrc, reason: "HLS is not supported in this browser" }, messages.unsupported);
  }, [initialTime, loadVideo, loadVideoNative, messages.streamLoadFailed, messages.unsupported, reportError, videoSrc]);
  const destroy = (0, import_react3.useCallback)(() => {
    clearTimers();
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const v = videoRef.current;
    if (v) {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("durationchange", onDur);
      v.pause();
      v.removeAttribute("src");
      v.load();
      if (activeExclusiveVideo === v) activeExclusiveVideo = null;
    }
    videoRef.current = null;
    onVideoRefChange == null ? void 0 : onVideoRefChange(null);
    notifyActiveChange(null, "destroy");
    setNextPlaying(false);
    if (durationProp === void 0) setDurationState(0);
    if (currentTimeProp === void 0) setCurrentTimeState(0);
  }, [
    clearTimers,
    currentTimeProp,
    durationProp,
    notifyActiveChange,
    onDur,
    onTime,
    onVideoRefChange,
    setNextPlaying
  ]);
  const videoClickHandler = (0, import_react3.useCallback)(() => {
    if (!handleClick) return;
    if (playOnClick) toggleAction();
    onVideoClick == null ? void 0 : onVideoClick();
  }, [handleClick, onVideoClick, playOnClick, toggleAction]);
  const fullScreenAction = (0, import_react3.useCallback)(() => {
    if (typeof document === "undefined") return;
    const doc = document;
    const videoEl = videoRef.current;
    const containerEl = containerRef.current;
    const isFs = !!document.fullscreenElement || !!doc.webkitFullscreenElement || !!doc.mozFullScreenElement || !!doc.msFullscreenElement;
    if (isFs) {
      if (document.exitFullscreen) void document.exitFullscreen();
      else if (doc.webkitExitFullscreen) void doc.webkitExitFullscreen();
      else if (doc.msExitFullscreen) void doc.msExitFullscreen();
      return;
    }
    if (!fullscreenAllowed) return;
    if (containerEl) {
      if (containerEl.requestFullscreen) void containerEl.requestFullscreen();
      else if (containerEl.webkitRequestFullscreen) void containerEl.webkitRequestFullscreen();
      else if (containerEl.msRequestFullscreen) void containerEl.msRequestFullscreen();
      else if (videoEl && videoEl.webkitEnterFullscreen) void videoEl.webkitEnterFullscreen();
      return;
    }
    if (videoEl) {
      if (videoEl.requestFullscreen) void videoEl.requestFullscreen();
      else if (videoEl.webkitEnterFullscreen) void videoEl.webkitEnterFullscreen();
    }
  }, [fullscreenAllowed]);
  const videoDbClickHandler = (0, import_react3.useCallback)(() => {
    if (!handleClick) return;
    fullScreenAction();
    onVideoDoubleClick == null ? void 0 : onVideoDoubleClick();
  }, [fullScreenAction, handleClick, onVideoDoubleClick]);
  const showClickHandler = (0, import_react3.useCallback)(() => {
    setControlVisible((st) => !st);
  }, []);
  const retryLoadHandler = (0, import_react3.useCallback)(() => {
    clearErrorState();
    setReloadToken((value) => value + 1);
  }, [clearErrorState]);
  const videoErrorHandler = (0, import_react3.useCallback)(() => {
    const video = videoRef.current;
    const error = video == null ? void 0 : video.error;
    const src = (video == null ? void 0 : video.currentSrc) || videoSrc;
    if (hlsRef.current && src.startsWith("blob:")) return;
    reportError(error, { type: "native", src }, getNativeVideoErrorMessage(error, messages));
  }, [messages, reportError, videoSrc]);
  const videoLoadedHandler = (0, import_react3.useCallback)(() => {
    clearErrorState();
  }, [clearErrorState]);
  const mouseMoveHandler = (0, import_react3.useCallback)(() => {
    if (controlTime.current) clearTimeout(controlTime.current);
    setControlVisible(true);
    controlTime.current = setTimeout(() => {
      setControlVisible(false);
    }, 1e3 * 10);
  }, []);
  (0, import_react3.useImperativeHandle)(
    ref,
    () => ({
      play: playAction,
      pause: pauseAction,
      seek: seekSetTime,
      fullscreen: fullScreenAction,
      getVideoElement: () => videoRef.current
    }),
    [fullScreenAction, pauseAction, playAction, seekSetTime]
  );
  (0, import_react3.useEffect)(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = muted;
  }, [muted]);
  (0, import_react3.useEffect)(() => {
    if (playingProp === void 0) return;
    if (!canAttemptPlayback(videoRef.current)) return;
    if (playingProp) void playAction();
    else pauseAction();
  }, [pauseAction, playAction, playingProp]);
  (0, import_react3.useEffect)(() => {
    const el = videoRef.current;
    if (!el || currentTimeProp === void 0) return;
    if (Math.abs(el.currentTime - currentTimeProp) < 0.25) return;
    el.currentTime = clampTime(currentTimeProp, duration);
  }, [currentTimeProp, duration]);
  (0, import_react3.useEffect)(() => {
    if (!videoRef.current) return;
    const loadId = sourceLoadId.current + 1;
    sourceLoadId.current = loadId;
    clearErrorState();
    fatalReloadCount.current = 0;
    netRetryCount.current = 0;
    mediaRecoverCount.current = 0;
    liveStabilityMode.current = false;
    liveStallEvents.current = [];
    resetMediaForSourceChange();
    if (sourceType === "native" || type === "video") loadVideoNative(loadId);
    else if (sourceType === "hls") void loadVideo(initialTime, loadId);
    else if (isLikelyHlsSource(videoSrc)) void loadVideoHls(loadId);
    else loadVideoNative(loadId);
    return () => {
      sourceLoadId.current += 1;
      resetMediaForSourceChange();
    };
  }, [
    clearErrorState,
    loadVideo,
    loadVideoHls,
    loadVideoNative,
    initialTime,
    resetMediaForSourceChange,
    reloadKey,
    reloadToken,
    sourceType,
    type,
    videoSrc
  ]);
  (0, import_react3.useEffect)(() => {
    if (!autoPlay) return;
    if (!canAttemptPlayback(videoRef.current)) return;
    void playAction();
  }, [autoPlay, playAction]);
  (0, import_react3.useEffect)(() => {
    if (typeof document === "undefined") return;
    const handleKeyDown = (event) => {
      if (event.code !== "KeyF") return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (active !== true) return;
      if (isEditableKeyTarget(event.target)) return;
      event.preventDefault();
      fullScreenAction();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, fullScreenAction]);
  (0, import_react3.useEffect)(() => {
    if (typeof document === "undefined") return;
    const doc = document;
    const handleFsChange = () => {
      const fs = !!document.fullscreenElement || !!doc.webkitFullscreenElement || !!doc.mozFullScreenElement || !!doc.msFullscreenElement;
      setIsFullscreen(fs);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    document.addEventListener("mozfullscreenchange", handleFsChange);
    document.addEventListener("MSFullscreenChange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      document.removeEventListener("mozfullscreenchange", handleFsChange);
      document.removeEventListener("MSFullscreenChange", handleFsChange);
    };
  }, []);
  (0, import_react3.useEffect)(() => {
    return () => {
      setTimeD.current.cancel();
      destroy();
    };
  }, [destroy]);
  const lastActiveState = (0, import_react3.useRef)(active);
  (0, import_react3.useEffect)(() => {
    const prevActive = lastActiveState.current;
    lastActiveState.current = active;
    if (active === true && prevActive !== true) {
      void playAction();
    }
  }, [active, playAction]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    VideoPlayerStyles,
    {
      ref: containerRef,
      onMouseMove: mouseMoveHandler,
      className: isFullscreen ? "VideoPlayer VideoPlayer--fullscreen" : "VideoPlayer",
      type,
      $isMobile: isMobile,
      $mobileType: mobileType,
      $showControl: showControl,
      $alwaysShowSegments: alwaysShowSegments,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerCancel || onPointerUp,
      $color: accentColor,
      children: [
        VideoTopBar && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "video-top-bar", children: VideoTopBar }),
        isFullscreen && VideoRightBar && !isMobile && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "video-right-bar", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { onClick: showClickHandler, className: "video-right-bar-toggle", children: "<" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "video-right-bar-content", children: VideoRightBar })
        ] }),
        !isFullscreen && VideoRightBar && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "video-right-bar", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { onClick: showClickHandler, className: "video-right-bar-toggle", children: "<" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "video-right-bar-content", children: VideoRightBar })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "video-wrapper", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "video",
            {
              ...videoProps,
              controls: false,
              ref: setVideoEl,
              crossOrigin,
              playsInline: true,
              muted,
              preload,
              loop,
              onPlay: () => setNextPlaying(true),
              onPause: () => setNextPlaying(false),
              onEnded: () => setNextPlaying(false),
              onLoadedData: videoLoadedHandler,
              onCanPlay: videoLoadedHandler,
              onError: videoErrorHandler,
              onClick: videoClickHandler,
              onDoubleClick: videoDbClickHandler,
              poster
            }
          ),
          errorState && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "video-error-overlay", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "video-error-content", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "video-error-title", children: errorState.message }),
            errorState.details.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "video-error-details", children: errorState.details.map((detail) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "video-error-detail", children: detail }, detail)) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", onClick: retryLoadHandler, className: "video-error-retry", children: messages.retry })
          ] }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          VideoPlayerControls,
          {
            variant: controlsVariant,
            fullScreenAction,
            fullscreenAllowed,
            showControl,
            playAction,
            pauseAction,
            seekSetTime,
            seekPrevAction,
            seekNextAction,
            playing,
            muted,
            onMutedChange: setNextMuted,
            duration,
            currentTime,
            title
          }
        )
      ]
    }
  );
};
var VideoPlayer = (0, import_react3.memo)((0, import_react3.forwardRef)(VideoPlayerBase));
var VideoPlayer_default = VideoPlayer;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  VideoPlayer,
  hasNativeHlsSupport
});
