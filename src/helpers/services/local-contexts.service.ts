import { Injectable } from '@angular/core';

type LocalContextsSource = 'proxy' | 'direct';

export interface LocalContextsDisplayItem {
  trackId: string;
  kind: 'notice' | 'label';
  title: string;
  text: string;
  imageUrl: string;
  communityName: string;
  externalUrl: string;
}

export interface LocalContextsProjectData {
  projectPage: string;
  items: LocalContextsDisplayItem[];
  source: LocalContextsSource;
}

interface LocalContextsRequest {
  headers?: HeadersInit;
  source: LocalContextsSource;
  url: string;
}

interface LocalContextsCacheEntry {
  data: LocalContextsProjectData;
  expiresAt: number;
  staleExpiresAt: number;
}

const LOCAL_CONTEXTS_CACHE_TTL_MS = 5 * 60 * 1000;
const LOCAL_CONTEXTS_STALE_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root'
})
export class LocalContextsService {
  private readonly runtimeEnv = (window as any)?.__env || {};
  private readonly proxyBase = this.normalizeBaseUrl(
    this.runtimeEnv.LOCAL_CONTEXTS_PROXY_BASE || '/localcontexts-api'
  );
  private readonly directApiBase = this.normalizeBaseUrl(
    this.runtimeEnv.LOCAL_CONTEXTS_API_BASE_URL || 'https://localcontextshub.org/api/v2'
  );
  private readonly browserApiKey = `${this.runtimeEnv.LOCAL_CONTEXTS_API_KEY || ''}`.trim();
  private readonly projectPageBaseUrl = this.normalizeBaseUrl(
    this.runtimeEnv.LOCAL_CONTEXTS_PROJECT_PAGE_BASE_URL || 'https://localcontextshub.org/projects'
  );
  private readonly projectCache = new Map<string, LocalContextsCacheEntry>();
  private readonly inFlightRequests = new Map<string, Promise<LocalContextsProjectData>>();

  private readonly authHeaderStrategies: Array<(apiKey: string) => HeadersInit> = [
    (apiKey: string) => ({ 'X-Api-Key': apiKey }),
    (apiKey: string) => ({ 'X-API-Key': apiKey }),
    (apiKey: string) => ({ Authorization: `Bearer ${apiKey}` }),
    (apiKey: string) => ({ 'Api-Key': apiKey }),
  ];

  getProjectPageUrl(projectId: string): string {
    const encodedId = encodeURIComponent(projectId || '');
    return `${this.projectPageBaseUrl}/${encodedId}`;
  }

  async fetchProject(projectId: string): Promise<LocalContextsProjectData> {
    const normalizedProjectId = `${projectId || ''}`.trim();
    if (!normalizedProjectId) throw new Error('Missing Local Contexts Project ID');

    const now = Date.now();
    const cachedProject = this.projectCache.get(normalizedProjectId);
    if (cachedProject && cachedProject.expiresAt > now) return cachedProject.data;

    const inFlightRequest = this.inFlightRequests.get(normalizedProjectId);
    if (inFlightRequest) return inFlightRequest;

    const request = this.fetchProjectFromApi(normalizedProjectId)
      .then((projectData: LocalContextsProjectData) => {
        const cachedAt = Date.now();
        this.projectCache.set(normalizedProjectId, {
          data: projectData,
          expiresAt: cachedAt + LOCAL_CONTEXTS_CACHE_TTL_MS,
          staleExpiresAt: cachedAt + LOCAL_CONTEXTS_STALE_TTL_MS,
        });
        return projectData;
      })
      .catch((error: any) => {
        if (cachedProject && cachedProject.staleExpiresAt > Date.now()) return cachedProject.data;
        throw error;
      })
      .finally(() => this.inFlightRequests.delete(normalizedProjectId));

    this.inFlightRequests.set(normalizedProjectId, request);
    return request;
  }

  private async fetchProjectFromApi(projectId: string): Promise<LocalContextsProjectData> {
    const encodedId = encodeURIComponent(projectId);
    const projectPage = this.getProjectPageUrl(projectId);
    const requests = this.buildProjectRequests(encodedId);
    let lastError: any = null;

    for (const request of requests) {
      try {
        const response = await fetch(request.url, {
          headers: {
            Accept: 'application/json',
            ...(request.headers || {}),
          }
        });

        if (!response.ok) {
          const attempt = response.headers.get('x-local-contexts-attempt') || '';
          lastError = new Error(`HTTP ${response.status}${attempt ? ` via ${attempt}` : ''}`);
          if (response.status === 401 || response.status === 403) continue;
          throw lastError;
        }

        const payload = await this.parseJsonResponse(response);
        const projectPayload = this.resolveProjectPayload(payload);
        return {
          items: this.normalizeItems(payload, projectPage),
          projectPage: this.firstString(projectPayload?.project_page, projectPayload?.projectPage) || projectPage,
          source: request.source,
        };
      } catch (error: any) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to fetch Local Contexts Project');
  }

  private buildProjectRequests(encodedId: string): LocalContextsRequest[] {
    const requests: LocalContextsRequest[] = [];

    if (this.proxyBase) {
      requests.push({
        source: 'proxy',
        url: this.withDefaultQueryParams(`${this.proxyBase}/projects/${encodedId}/`),
      });
    }

    if (this.browserApiKey) {
      this.authHeaderStrategies.forEach((buildHeaders) => {
        requests.push({
          headers: buildHeaders(this.browserApiKey),
          source: 'direct',
          url: this.withDefaultQueryParams(`${this.directApiBase}/projects/${encodedId}/`),
        });
      });
    }

    return requests;
  }

  private normalizeItems(payload: any, projectPage: string): LocalContextsDisplayItem[] {
    const projectPayload = this.resolveProjectPayload(payload);
    const notices = this.toDisplayItems(
      [
        ...this.toArray(projectPayload?.notice),
        ...this.toArray(projectPayload?.notices),
        ...this.toArray(projectPayload?.project_notice),
        ...this.toArray(projectPayload?.project_notices),
      ],
      'notice',
      projectPage
    );
    const labels = this.toDisplayItems(
      [
        ...this.toArray(projectPayload?.bc_labels),
        ...this.toArray(projectPayload?.bcLabels),
        ...this.toArray(projectPayload?.tk_labels),
        ...this.toArray(projectPayload?.tkLabels),
        ...this.toArray(projectPayload?.labels),
        ...this.toArray(projectPayload?.project_labels),
        ...this.toArray(projectPayload?.projectLabels),
      ],
      'label',
      projectPage
    );

    return [...notices, ...labels].filter(
      (item, index, allItems) =>
        allItems.findIndex((candidate) => candidate.trackId === item.trackId) === index
    );
  }

  private toDisplayItems(items: any[], kind: 'notice' | 'label', projectPage: string): LocalContextsDisplayItem[] {
    return items
      .map((item: any, index: number) => {
        const title = this.firstString(
          item?.name,
          item?.title,
          item?.label_name,
          item?.notice_name,
          item?.labelName,
          item?.noticeName,
          item?.translated_name?.en,
          item?.slug
        ) || `${kind === 'notice' ? 'Notice' : 'Label'} ${index + 1}`;
        const text = this.firstString(
          item?.default_text,
          item?.text,
          item?.description,
          item?.label_text,
          item?.notice_text,
          item?.labelText,
          item?.noticeText,
          item?.translated_text?.en
        ) || 'No Local Contexts description is available.';
        const imageUrl = this.firstString(
          item?.img_url,
          item?.image_url,
          item?.svg_url,
          item?.imgUrl,
          item?.imageUrl,
          item?.svgUrl,
          item?.image?.url,
          item?.icon?.url
        ) || '';
        const communityName = this.firstString(
          item?.community?.name,
          item?.community_name,
          item?.created_by?.name
        ) || '';
        const externalUrl = this.firstString(item?.project_page, item?.url, item?.page_url) || projectPage;
        const rawId = this.firstString(item?.uuid, item?.unique_id, item?.id, item?.slug, title) || `${kind}-${index}`;

        return {
          communityName,
          externalUrl,
          imageUrl,
          kind,
          text,
          title,
          trackId: `${kind}-${rawId}`,
        };
      })
      .filter((item: LocalContextsDisplayItem) => !!item.imageUrl || !!item.title || !!item.text);
  }

  private resolveProjectPayload(payload: any): any {
    const results = this.toArray(payload?.results);
    if (results.length === 1 && !this.hasDisplayItems(payload)) return results[0];

    return payload;
  }

  private hasDisplayItems(payload: any): boolean {
    return [
      payload?.notice,
      payload?.notices,
      payload?.project_notice,
      payload?.project_notices,
      payload?.bc_labels,
      payload?.bcLabels,
      payload?.tk_labels,
      payload?.tkLabels,
      payload?.labels,
      payload?.project_labels,
      payload?.projectLabels,
    ].some((value: any) => this.toArray(value).length > 0);
  }

  private async parseJsonResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    const rawText = await response.text();
    return JSON.parse(rawText);
  }

  private firstString(...values: any[]): string {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) return value.trim();
    }

    return '';
  }

  private normalizeBaseUrl(value: string): string {
    return `${value || ''}`.trim().replace(/\/+$/, '');
  }

  private withDefaultQueryParams(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}format=json&version=2.0`;
  }

  private toArray(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return [value];
    return [];
  }
}
