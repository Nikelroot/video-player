const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const asText = (value: unknown) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return null;
};

const getMediaErrorCodeLabel = (code: number) => {
  switch (code) {
    case 1:
      return 'MEDIA_ERR_ABORTED';
    case 2:
      return 'MEDIA_ERR_NETWORK';
    case 3:
      return 'MEDIA_ERR_DECODE';
    case 4:
      return 'MEDIA_ERR_SRC_NOT_SUPPORTED';
    default:
      return 'MEDIA_ERR_UNKNOWN';
  }
};

export const getPlaybackErrorCodeText = (error: unknown) => {
  if (!isRecord(error) || typeof error.code !== 'number') return null;

  return `${getMediaErrorCodeLabel(error.code)} (${error.code})`;
};

const getResponseSummary = (response: unknown) => {
  if (!isRecord(response)) return null;

  const code = asText(response.code);
  const text = asText(response.text);

  if (code && text) return `${code} ${text}`;
  return code || text;
};

const getSource = (data: unknown) => {
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

const addDetail = (details: string[], label: string, value: unknown) => {
  const text = asText(value);
  if (!text) return;

  const line = `${label}: ${text}`;
  if (!details.includes(line)) {
    details.push(line);
  }
};

export const formatPlaybackErrorDetails = (error: unknown, data?: unknown) => {
  const details: string[] = [];

  addDetail(details, 'Код', getPlaybackErrorCodeText(error));

  if (error instanceof Error) {
    addDetail(details, 'Ошибка', error.message || error.name);
  } else if (typeof error === 'string') {
    addDetail(details, 'Ошибка', error);
  }

  if (isRecord(data)) {
    addDetail(details, 'Тип', data.type);
    addDetail(details, 'Детали', data.details);
    addDetail(details, 'Причина', data.reason);
    addDetail(details, 'HTTP', getResponseSummary(data.response));
    addDetail(details, 'Источник', getSource(data));
  }

  return details;
};
