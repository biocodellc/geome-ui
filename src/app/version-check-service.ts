import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class VersionCheckService {
  constructor(private http: HttpClient) {}

  checkVersion(): void {
    this.http.get<{ version: string }>('/assets/version.json', { headers: { 'Cache-Control': 'no-store' } })
      .subscribe({
        next: (data) => {
          const current = data.version;
          const stored = localStorage.getItem('app_version');

          if (stored !== current) {
            console.log(`🌀 Version changed: ${stored} → ${current}`);
            localStorage.clear();
            sessionStorage.clear();
            localStorage.setItem('app_version', current);
            location.reload();
          }
        },
        error: () => console.warn('⚠️ Could not check version.json')
      });
  }
}

