const DEFAULT_API_BASE_URL = 'https://localcontextshub.org/api/v2';
const CACHE_TTL_SECONDS = positiveNumber(process.env.LOCAL_CONTEXTS_CACHE_TTL_SECONDS, 300);
const STALE_TTL_SECONDS = positiveNumber(process.env.LOCAL_CONTEXTS_STALE_TTL_SECONDS, 86400);
const responseCache = new Map();

const authHeaderStrategies = [
  (apiKey) => ({ 'X-Api-Key': apiKey }),
  (apiKey) => ({ 'X-API-Key': apiKey }),
  (apiKey) => ({ Authorization: `Bearer ${apiKey}` }),
  (apiKey) => ({ 'Api-Key': apiKey }),
];

const jsonHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'content-type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      body: '',
      headers: jsonHeaders,
      statusCode: 204,
    };
  }

  const apiKey = `${process.env.LOCAL_CONTEXTS_API_KEY || ''}`.trim();
  if (!apiKey) {
    return {
      body: JSON.stringify({ message: 'LOCAL_CONTEXTS_API_KEY is not configured.' }),
      headers: jsonHeaders,
      statusCode: 500,
    };
  }

  const targetRequests = buildTargetRequests(event, apiKey);
  if (!targetRequests.length) {
    return {
      body: JSON.stringify({ message: 'Missing Local Contexts API path.' }),
      headers: jsonHeaders,
      statusCode: 400,
    };
  }

  const cacheKey = buildCacheKey(event);
  const freshCachedResponse = getCachedResponse(cacheKey, false);
  if (freshCachedResponse) return cachedProxyResponse(freshCachedResponse, 'hit');

  let lastResponse;
  let lastError;
  let lastAttempt = '';

  for (const request of targetRequests) {
    let response;
    try {
      response = await fetch(request.url, { headers: request.headers });
    } catch (error) {
      lastError = error;
      lastAttempt = request.label;
      continue;
    }

    lastResponse = response;
    lastAttempt = request.label;
    if (response.ok) {
      const proxiedResponse = await proxyResponse(response, request.label, 'miss');
      cacheResponse(cacheKey, proxiedResponse);
      return proxiedResponse;
    }
    if ([401, 403, 404].includes(response.status)) continue;
    break;
  }

  const staleCachedResponse = getCachedResponse(cacheKey, true);
  if (staleCachedResponse) {
    return cachedProxyResponse(
      staleCachedResponse,
      'stale',
      lastResponse?.status || errorMessage(lastError)
    );
  }

  if (lastResponse) return proxyResponse(lastResponse, lastAttempt, 'bypass');

  return {
    body: JSON.stringify({ message: 'Unable to reach the Local Contexts API.', error: errorMessage(lastError) }),
    headers: {
      ...jsonHeaders,
      'cache-control': 'no-store',
      'x-local-contexts-attempt': lastAttempt,
      'x-local-contexts-cache': 'error',
    },
    statusCode: 502,
  };
};

function buildTargetRequests(event, apiKey) {
  const query = new URLSearchParams(event.queryStringParameters || {});
  const requestedPath = resolveRequestedPath(event, query);
  if (!requestedPath) return [];

  query.delete('path');

  const apiBaseUrl = normalizeBaseUrl(process.env.LOCAL_CONTEXTS_API_BASE_URL || DEFAULT_API_BASE_URL);
  const candidateUrls = buildCandidateUrls(apiBaseUrl, requestedPath, query);
  const requests = [];

  for (const candidate of candidateUrls) {
    for (const buildHeaders of authHeaderStrategies) {
      requests.push({
        headers: {
          Accept: 'application/json',
          ...buildHeaders(apiKey),
        },
        label: `${candidate.mode}:${headerStrategyName(buildHeaders(apiKey))}`,
        url: candidate.url,
      });
    }

    // Some integrations expose public and partner-readable data without auth
    // or use query-based API key auth.
    requests.push({
      headers: { Accept: 'application/json' },
      label: `${candidate.mode}:no-auth`,
      url: candidate.url,
    });

    requests.push({
      headers: { Accept: 'application/json' },
      label: `${candidate.mode}:query-api-key`,
      url: appendQueryParam(candidate.url, 'api_key', apiKey),
    });
  }

  return dedupeRequests(requests);
}

function buildCacheKey(event) {
  const query = new URLSearchParams(event.queryStringParameters || {});
  const requestedPath = resolveRequestedPath(event, query).replace(/^\/+|\/+$/g, '');
  query.delete('path');
  query.delete('api_key');

  return `${requestedPath}?${query.toString()}`;
}

function resolveRequestedPath(event, query) {
  const queryPath = `${query.get('path') || ''}`.trim().replace(/^\/+/, '');
  if (queryPath) return queryPath;

  const candidatePaths = [
    event?.path,
    event?.rawUrl,
    event?.headers?.['x-original-uri'],
    event?.headers?.['x-nf-original-path'],
    event?.headers?.['x-forwarded-uri'],
    event?.headers?.['x-forwarded-path'],
  ].filter(Boolean);

  for (const candidate of candidatePaths) {
    const resolvedPath = extractRequestedPath(candidate);
    if (resolvedPath) return resolvedPath;
  }

  return '';
}

function extractRequestedPath(value) {
  const normalizedValue = `${value || ''}`.trim();
  if (!normalizedValue) return '';

  let pathname = normalizedValue;
  try {
    if (/^https?:\/\//i.test(normalizedValue)) {
      pathname = new URL(normalizedValue).pathname;
    }
  } catch (error) {
    pathname = normalizedValue;
  }

  const markers = [
    '/.netlify/functions/local-contexts/',
    '/localcontexts-api/',
  ];

  for (const marker of markers) {
    const index = pathname.indexOf(marker);
    if (index === -1) continue;

    const requestedPath = pathname.slice(index + marker.length).replace(/^\/+/, '');
    if (requestedPath) return requestedPath;
  }

  return '';
}

function buildCandidateUrls(apiBaseUrl, requestedPath, query) {
  const trimmedPath = requestedPath.replace(/^\/+|\/+$/g, '');
  const passthroughQuery = new URLSearchParams(query);
  passthroughQuery.delete('format');
  passthroughQuery.delete('version');
  const queryString = passthroughQuery.toString();
  const urls = [];

  urls.push({
    mode: 'documented-v2-root',
    url: `${apiBaseUrl}/${trimmedPath}/${queryString ? `?${queryString}` : ''}`,
  });

  urls.push({
    mode: 'documented-v2-root-no-trailing-slash',
    url: `${apiBaseUrl}/${trimmedPath}${queryString ? `?${queryString}` : ''}`,
  });

  if (!/\/v[12]$/i.test(apiBaseUrl)) {
    const versionedModes = [
      { key: 'v2-root', root: `${apiBaseUrl}/v2` },
      { key: 'v1-root', root: `${apiBaseUrl}/v1` },
    ];

    versionedModes.forEach((mode) => {
      urls.push({
        mode: mode.key,
        url: `${mode.root}/${trimmedPath}/${queryString ? `?${queryString}` : ''}`,
      });
      urls.push({
        mode: `${mode.key}-no-trailing-slash`,
        url: `${mode.root}/${trimmedPath}${queryString ? `?${queryString}` : ''}`,
      });
    });
  }

  return dedupeByUrl(urls);
}

function appendQueryParam(url, key, value) {
  if (!value) return url;
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set(key, value);
  return parsedUrl.toString();
}

function dedupeByUrl(items) {
  return items.filter((item, index, list) => list.findIndex((candidate) => candidate.url === item.url) === index);
}

function dedupeRequests(requests) {
  return requests.filter(
    (request, index, list) =>
      list.findIndex((candidate) => candidate.url === request.url && JSON.stringify(candidate.headers) === JSON.stringify(request.headers)) === index
  );
}

function headerStrategyName(headers) {
  const keys = Object.keys(headers);
  if (!keys.length) return 'none';
  return keys[0];
}

function normalizeBaseUrl(value) {
  return `${value || ''}`.trim().replace(/\/+$/, '');
}

async function proxyResponse(response, attempt, cacheStatus) {
  const body = await response.text();
  const contentType = response.headers.get('content-type') || 'application/json';
  const cacheable = response.ok;

  return {
    body,
    headers: {
      'access-control-allow-origin': '*',
      ...cacheHeaders(cacheable),
      'content-type': contentType,
      'x-local-contexts-attempt': attempt || '',
      'x-local-contexts-cache': cacheStatus || 'bypass',
      'x-local-contexts-upstream-status': `${response.status}`,
    },
    statusCode: response.status,
  };
}

function cacheHeaders(cacheable) {
  if (!cacheable) return { 'cache-control': 'no-store' };

  const browserCache = `public, max-age=${CACHE_TTL_SECONDS}, stale-while-revalidate=${STALE_TTL_SECONDS}`;
  const cdnCache = `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${STALE_TTL_SECONDS}`;
  return {
    'cache-control': browserCache,
    'netlify-cdn-cache-control': cdnCache,
  };
}

function cacheResponse(cacheKey, response) {
  const cachedAt = Date.now();
  responseCache.set(cacheKey, {
    body: response.body,
    cachedAt,
    expiresAt: cachedAt + CACHE_TTL_SECONDS * 1000,
    headers: { ...response.headers },
    staleExpiresAt: cachedAt + STALE_TTL_SECONDS * 1000,
    statusCode: response.statusCode,
  });
}

function getCachedResponse(cacheKey, allowStale) {
  const cachedResponse = responseCache.get(cacheKey);
  if (!cachedResponse) return null;

  const now = Date.now();
  if (cachedResponse.expiresAt > now) return cachedResponse;
  if (allowStale && cachedResponse.staleExpiresAt > now) return cachedResponse;

  responseCache.delete(cacheKey);
  return null;
}

function cachedProxyResponse(cachedResponse, cacheStatus, upstreamStatus) {
  return {
    body: cachedResponse.body,
    headers: {
      ...cachedResponse.headers,
      age: `${Math.max(0, Math.floor((Date.now() - cachedResponse.cachedAt) / 1000))}`,
      'x-local-contexts-cache': cacheStatus,
      ...(upstreamStatus ? { 'x-local-contexts-upstream-status': `${upstreamStatus}` } : {}),
    },
    statusCode: cachedResponse.statusCode,
  };
}

function errorMessage(error) {
  if (!error) return '';
  return error.message || `${error}`;
}

function positiveNumber(value, fallback) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}
