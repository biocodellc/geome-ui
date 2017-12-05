class AuthService {
  constructor($rootScope, $http, $q, $timeout, StorageService, AUTH_TIMEOUT, REST_ROOT, APP_ROOT) {
    this._triedToRefresh = false;
    this._authTimoutPromise = undefined;

    this.rootScope = $rootScope;
    this.storageService = StorageService;
    this.APP_ROOT = APP_ROOT;
    this.AUTH_TIMEOUT = AUTH_TIMEOUT;
    this.REST_ROOT = REST_ROOT;
    this.http = $http;
    this.q = $q;
    this.timeout = $timeout;
  }

  getAccessToken() {
    return this.storageService.get('accessToken');
  }

  authenticate(username, password) {
    const data = {
      client_id: client_id,
      redirect_uri: this.APP_ROOT + '/oauth',
      grant_type: 'password',
      username: username,
      password: password,
    };

    return this.http.post(this.REST_ROOT + 'authenticationService/oauth/accessToken', data)
      .then(function (response) {
        this._authSuccess(response.data);
      }, function (response) {
        this.clearTokens();
        return this.q.reject(response);
      });
  }

  clearTokens() {
    this.storageService.extend({
      accessToken: undefined,
      refreshToken: undefined,
      oAuthTimestamp: undefined,
    });
  }

  refreshAccessToken() {
    let refreshToken = this.storageService.get('refreshToken');
    if (refreshToken && this._checkAuthenticated() && !this._triedToRefresh) {
      return this.http.post(this.REST_ROOT + 'authenticationService/oauth/refresh', {
          client_id: client_id,
          refresh_token: refreshToken,

        })
        .then(function (response) {
            this._authSuccess(response.data);
          },
          function (response) {
            this.rootScope.$broadcast('$userRefreshFailedEvent');
            this._triedToRefresh = true;
            return this.q.reject(response);
          });
    }

    this.rootScope.$broadcast('$userRefreshFailedEvent');
    return this.q.reject();
  }

  _resetAuthTimeout() {
    if (this._authTimoutPromise) {
      this.timeout.cancel(this._authTimoutPromise);
    }

    const signoutUser = () => this.rootScope.$broadcast('$authTimeoutEvent');

    this._authTimoutPromise = this.timeout(signoutUser, this.AUTH_TIMEOUT);
  }

  _authSuccess(data) {
    this._setOAuthTokens(data.access_token, data.refresh_token);
    this._resetAuthTimeout();
    this._triedToRefresh = false;
  }

  _checkAuthenticated() {
    return !this._isTokenExpired() && this.getAccessToken();
  }

  _isTokenExpired() {
    const oAuthTimestamp = this.storageService.get('oAuthTimestamp');
    const now = new Date().getTime();

    if (now - oAuthTimestamp > this.AUTH_TIMEOUT) {
      this.clearTokens();
      return true;
    }

    return false;
  }

  _setOAuthTokens(accessToken, refreshToken) {
    this.storageService.extend({
      accessToken: accessToken,
      refreshToken: refreshToken,
      oAuthTimestamp: new Date().getTime(),
    });
  }
}

AuthService.$inject = [ '$rootScope', '$http', '$q', '$timeout', 'StorageService', 'AUTH_TIMEOUT', 'REST_ROOT', 'APP_ROOT' ];

export default AuthService;
