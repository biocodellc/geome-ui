import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { BehaviorSubject, catchError, Observable, switchMap, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../services/authentication.service';
import { DummyDataService } from '../services/dummy-data.service';

let isRefreshing: boolean = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);
  const userService = inject(UserService);
  const toastr = inject(ToastrService);
  const dataService = inject(DummyDataService);
  let currentUser = authService.getUserFromStorage();

  if (currentUser && currentUser?.accessToken && !req.params.keys().includes('access_token')) {
    req = addToken(req, currentUser.accessToken);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && shouldAttemptTokenRefresh(error, req)) {
        return handle401Error(req, next, authService, userService);
      }
      toastr.error(error.error?.usrMessage || error.error?.message || 'Server Error');
      dataService.loadingState.next(false);
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setParams: { "access_token": token }
  });
}

function shouldAttemptTokenRefresh(error: HttpErrorResponse, request: HttpRequest<any>): boolean {
  const url = (request?.url || '').toLowerCase();
  if (url.includes('/oauth/refresh') || url.includes('/oauth/introspect')) return false;

  const devMessage = `${error?.error?.developerMessage || ''}`.toLowerCase();
  const hasAccessTokenPhrase = /access[_\s-]?token/.test(devMessage);
  const hasExpiredOrInvalid = /(invalid|expired)/.test(devMessage);
  return hasAccessTokenPhrase && hasExpiredOrInvalid;
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthenticationService, UserService: UserService): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getUserFromStorage()?.refreshToken;
    if (!refreshToken) {
      authService.logoutUser();
      return throwError(() => 'Refresh token is missing');
    }

    return UserService.refreshUserToken(refreshToken).pipe(
      switchMap((res: any) => {
        if (!res.error) {
          const newToken = res.access_token;
          refreshTokenSubject.next(newToken);
          updateUserVal(authService.getUserFromStorage(), res, authService);
          isRefreshing = false;
          return next(addToken(request, newToken));
        } else {
          authService.logoutUser();
          isRefreshing = false;
          return throwError(() => res.message);
        }
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logoutUser();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      switchMap((token: string | null) => {
        if (token) {
          return next(addToken(request, token));
        } else {
          return throwError(() => 'Token refresh in progress');
        }
      })
    );
  }
}

function updateUserVal(user:any, new_data:any, authS:AuthenticationService){
  if (!user?.username) return;
  authS.saveUser(new_data, user.username);
}
