import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

const CHUNK_RELOAD_KEY = 'geome_chunk_reload_attempted';

function getErrorMessage(input: any): string {
  if (!input) return '';
  if (typeof input === 'string') return input;
  if (typeof input?.message === 'string') return input.message;
  if (typeof input?.toString === 'function') return String(input);
  return '';
}

function isChunkLoadError(message: string): boolean {
  const text = (message || '').toLowerCase();
  return (
    text.includes('failed to fetch dynamically imported module') ||
    text.includes('loading chunk') ||
    text.includes('module script') && text.includes('mime type')
  );
}

function recoverFromChunkLoadFailure(message: string): void {
  if (!isChunkLoadError(message)) return;
  const hasRetried = sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1';
  if (hasRetried) return;
  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
  const url = new URL(window.location.href);
  url.searchParams.set('_cb', Date.now().toString());
  window.location.replace(url.toString());
}

window.addEventListener('error', (event: ErrorEvent) => {
  recoverFromChunkLoadFailure(getErrorMessage(event?.error) || getErrorMessage(event?.message));
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const message = getErrorMessage(event?.reason);
  if (!isChunkLoadError(message)) return;
  event.preventDefault();
  recoverFromChunkLoadFailure(message);
});

fetch('/assets/version.json', { cache: 'no-store' })
  .then(res => res.json())
  .then(({ version }) => {
    const stored = localStorage.getItem('app_version');
    if (stored !== version) {
      console.warn(`🌀 Version changed: ${stored} → ${version}`);
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('app_version', version);
      location.reload();
    } else {
      bootstrapApplication(AppComponent, appConfig)
        .then(() => sessionStorage.removeItem(CHUNK_RELOAD_KEY))
        .catch(err => console.error(err));
    }
  })
  .catch((err) => {
    console.error('⚠️ Version check failed. Proceeding anyway.', err);
    bootstrapApplication(AppComponent, appConfig)
      .then(() => sessionStorage.removeItem(CHUNK_RELOAD_KEY))
      .catch(e => console.error(e));
  });
