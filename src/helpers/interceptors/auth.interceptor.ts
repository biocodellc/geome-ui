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

  if (currentUser && currentUser?.accessToken && !req.params.keys().includes('accessToken')) {
    req = addToken(req, currentUser.accessToken);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(req, next, authService, userService);
      }
      toastr.error(error.error.usrMessage || 'Server Error');
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
          const body = { access_token: res.access_token, refresh_token: res.refresh_token };
          updateUserVal(authService.getUserFromStorage(), body, authService);
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
  const new_user_data = { ...user };
  new_user_data['access_token'] = new_data.access_token;
  new_user_data['refresh_token'] = new_data.refresh_token;
  authS.saveUser(new_user_data, user.username);
}