import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

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
        .catch(err => console.error(err));
    }
  })
  .catch((err) => {
    console.error('⚠️ Version check failed. Proceeding anyway.', err);
    bootstrapApplication(AppComponent, appConfig)
      .catch(e => console.error(e));
  });

