import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideToastr } from 'ngx-toastr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../helpers/interceptors/auth.interceptor';
import { GalleryModule } from 'ng-gallery';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient( withInterceptors([authInterceptor]) ),
    provideAnimations(),
    provideToastr({ timeOut: 2000, preventDuplicates: true }),
    importProvidersFrom(GalleryModule)
  ]
};
