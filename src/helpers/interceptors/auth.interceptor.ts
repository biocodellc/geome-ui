import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpHeaders, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { BehaviorSubject, catchError, Observable, switchMap, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

let isRefreshing: boolean = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);
  const userService = inject(UserService);
  const toastr = inject(ToastrService);
  let currentUser:any; //= authService.getCurrentUserVal();

  if (currentUser?.token && !req.headers.keys().includes('Authorization')) {
    req = addToken(req, currentUser.token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(req, next, authService, userService);
      }
      toastr.error(error.message);
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`),
  });
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthenticationService, apiService: ApiService): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getCurrentUserVal()?.refreshToken;
    if (!refreshToken) {
      authService.logoutUser();
      return throwError(() => 'Refresh token is missing');
    }

    const refreshTokenHeaders = new HttpHeaders({
      Authorization: `Bearer ${refreshToken}`,
    });

    return apiService.refereshToken('', refreshTokenHeaders).pipe(
      switchMap((res: any) => {
        if (!res.error) {
          const newToken = res.access_token;
          refreshTokenSubject.next(newToken);
          const body = { access_token: res.access_token, refresh_token: res.refresh_token };
          updateUserVal(authService.getCurrentUserVal(), body, authService);
          // authService.updateCurrentUserToken(newToken); // Update the token in your service
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
  new_user_data['token'] = new_data.access_token;
  new_user_data['refreshToken'] = new_data.refreshToken;
  authS.saveUser(new_user_data);
}