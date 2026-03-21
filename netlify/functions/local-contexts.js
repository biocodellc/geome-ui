const DEFAULT_API_BASE_URL = 'https://localcontextshub.org/api';

const authHeaderStrategies = [
  (apiKey) => ({ Authorization: `Bearer ${apiKey}` }),
  (apiKey) => ({ 'X-API-Key': apiKey }),
  (apiKey) => ({ 'X-Api-Key': apiKey }),
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

  const targetUrl = buildTargetUrl(event);
  if (!targetUrl) {
    return {
      body: JSON.stringify({ message: 'Missing Local Contexts API path.' }),
      headers: jsonHeaders,
      statusCode: 400,
    };
  }

  let lastResponse;

  for (const buildHeaders of authHeaderStrategies) {
    const response = await fetch(targetUrl, {
      headers: {
        Accept: 'application/json',
        ...buildHeaders(apiKey),
      }
    });

    lastResponse = response;
    if (response.status === 401 || response.status === 403) continue;
    return proxyResponse(response);
  }

  return proxyResponse(lastResponse);
};

function buildTargetUrl(event) {
  const query = new URLSearchParams(event.queryStringParameters || {});
  const requestedPath = resolveRequestedPath(event, query);
  if (!requestedPath) return '';

  query.delete('path');
  if (!query.has('format')) query.set('format', 'json');
  if (!query.has('version')) query.set('version', '2.0');

  const apiBaseUrl = `${process.env.LOCAL_CONTEXTS_API_BASE_URL || DEFAULT_API_BASE_URL}`
    .trim()
    .replace(/\/+$/, '');
  const queryString = query.toString();

  return `${apiBaseUrl}/${requestedPath}${queryString ? `?${queryString}` : ''}`;
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

async function proxyResponse(response) {
  const body = await response.text();
  const contentType = response.headers.get('content-type') || 'application/json';

  return {
    body,
    headers: {
      'access-control-allow-origin': '*',
      'cache-control': response.ok ? 'public, max-age=300' : 'no-store',
      'content-type': contentType,
    },
    statusCode: response.status,
  };
}
