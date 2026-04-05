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
    const encodedId = encodeURIComponent(projectId || '');
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
          lastError = new Error(`HTTP ${response.status}`);
          if (response.status === 401 || response.status === 403) continue;
          throw lastError;
        }

        const payload = await this.parseJsonResponse(response);
        return {
          items: this.normalizeItems(payload, projectPage),
          projectPage: this.firstString(payload?.project_page, payload?.projectPage) || projectPage,
          source: request.source,
        };
      } catch (error: any) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to fetch Local Contexts project');
  }

  private buildProjectRequests(encodedId: string): LocalContextsRequest[] {
    const requests: LocalContextsRequest[] = [];

    if (this.proxyBase) {
      requests.push({
        source: 'proxy',
        url: `${this.proxyBase}/projects/${encodedId}/`,
      });
    }

    if (this.browserApiKey) {
      this.authHeaderStrategies.forEach((buildHeaders) => {
        requests.push({
          headers: buildHeaders(this.browserApiKey),
          source: 'direct',
          url: `${this.directApiBase}/projects/${encodedId}/`,
        });
      });
    }

    return requests;
  }

  private normalizeItems(payload: any, projectPage: string): LocalContextsDisplayItem[] {
    const notices = this.toDisplayItems(
      this.toArray(payload?.notice ?? payload?.notices),
      'notice',
      projectPage
    );
    const labels = this.toDisplayItems(
      [
        ...this.toArray(payload?.bc_labels ?? payload?.bcLabels),
        ...this.toArray(payload?.tk_labels ?? payload?.tkLabels),
        ...this.toArray(payload?.labels),
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
          item?.translated_name?.en,
          item?.slug
        ) || `${kind === 'notice' ? 'Notice' : 'Label'} ${index + 1}`;
        const text = this.firstString(
          item?.default_text,
          item?.text,
          item?.description,
          item?.label_text,
          item?.notice_text,
          item?.translated_text?.en
        ) || 'No Local Contexts description is available.';
        const imageUrl = this.firstString(
          item?.img_url,
          item?.image_url,
          item?.svg_url,
          item?.image?.url,
          item?.icon?.url
        ) || '';
        const communityName = this.firstString(
          item?.community?.name,
          item?.community_name,
          item?.created_by?.name
        ) || '';
        const externalUrl = this.firstString(item?.project_page, item?.url, item?.page_url) || projectPage;
        const rawId = this.firstString(item?.uuid, item?.id, item?.slug, title) || `${kind}-${index}`;

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

  private toArray(value: any): any[] {
    return Array.isArray(value) ? value : [];
  }
}
