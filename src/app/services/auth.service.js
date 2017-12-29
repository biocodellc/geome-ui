import angular from "angular";

import storageService from './storage.service';
import CLIENT_ID from '../components/auth/clientId';


//TODO cleanup this service
class AuthService {
  constructor($rootScope, $http, $timeout, StorageService, AUTH_TIMEOUT, REST_ROOT, APP_ROOT) {
    'ngInject';

    this._triedToRefresh = false;
    this._authTimoutPromise = undefined;

    this.rootScope = $rootScope;
    this.storageService = StorageService;
    this.APP_ROOT = APP_ROOT;
    this.AUTH_TIMEOUT = AUTH_TIMEOUT;
    this.REST_ROOT = REST_ROOT;
    this.http = $http;
    this.timeout = $timeout;
  }

  getAccessToken() {
    return this.storageService.get('accessToken');
  }

  authenticate(username, password) {
    const data = {
      client_id: CLIENT_ID,
      redirect_uri: this.APP_ROOT + '/oauth',
      grant_type: 'password',
      username: username,
      password: password,
    };

    return this.http.post(this.REST_ROOT + 'authenticationService/oauth/accessToken', data)
      .then((response) => this._authSuccess(response.data))
      .catch((response) => {
        this.clearTokens();
        return Promise.reject(response);
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
          client_id: CLIENT_ID,
          refresh_token: refreshToken,

        })
        .then(({ data }) => this._authSuccess(data))
        .catch((response) => {
            this.rootScope.$broadcast('$userRefreshFailedEvent');
            this._triedToRefresh = true;
            return Promise.reject(response);
          });
    }

    this.rootScope.$broadcast('$userRefreshFailedEvent');
    return Promise.reject();
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

export default angular.module('fims.authService', [ storageService ])
  .service('AuthService', AuthService)
  .name;
