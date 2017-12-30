import angular from "angular";

import storageService from './storage.service';
import CLIENT_ID from '../components/auth/clientId';

export const AUTH_ERROR_EVENT = '$authError';

let triedToRefresh = false;
let timeoutId = undefined;

class AuthService {
  constructor($rootScope, $state, $http, $timeout, StorageService, AUTH_TIMEOUT, REST_ROOT, APP_ROOT) {
    'ngInject';

    this.$rootScope = $rootScope;
    this.$state = $state;
    this.StorageService = StorageService;
    this.APP_ROOT = APP_ROOT;
    this.AUTH_TIMEOUT = AUTH_TIMEOUT;
    this.REST_ROOT = REST_ROOT;
    this.$http = $http;
    this.$timeout = $timeout;
  }

  getAccessToken() {
    return this.StorageService.get('accessToken');
  }

  authenticate(username, password) {
    const data = {
      client_id: CLIENT_ID,
      redirect_uri: this.APP_ROOT + '/oauth',
      grant_type: 'password',
      username: username,
      password: password,
    };

    return this.$http.post(this.REST_ROOT + 'authenticationService/oauth/accessToken', data)
      .then(({ data }) => this._authSuccess(data, username))
      .catch((response) => {
        this.clearTokens();
        return Promise.reject(response);
      });
  }

  clearTokens() {
    this.StorageService.extend({
      username: undefined,
      accessToken: undefined,
      refreshToken: undefined,
      oAuthTimestamp: undefined,
    });
  }

  refreshAccessToken() {
    let refreshToken = this.StorageService.get('refreshToken');
    let username = this.StorageService.get('username');

    if (refreshToken && this._checkAuthenticated() && !triedToRefresh) {
      return this.$http.post(this.REST_ROOT + 'authenticationService/oauth/refresh', {
          client_id: CLIENT_ID,
          refresh_token: refreshToken,
        })
        .then(({ data }) => this._authSuccess(data, username))
        .catch((response) => {
          this.$rootScope.$broadcast(AUTH_ERROR_EVENT);
          this.clearTokens();
          triedToRefresh = true;
          return Promise.reject(response);
        });
    }

    this.$rootScope.$broadcast(AUTH_ERROR_EVENT);
    this.clearTokens();
    return Promise.reject();
  }

  _authSuccess(data, username) {
    this.StorageService.extend({
      username,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      oAuthTimestamp: new Date().getTime(),
    });
    this._resetAuthTimeout();
    triedToRefresh = false;
  }

  _resetAuthTimeout() {
    if (timeoutId) {
      this.$timeout.cancel(timeoutId);
    }

    timeoutId = this.$timeout(() => {
      this.$rootScope.$broadcast(AUTH_ERROR_EVENT);
      this.clearTokens();
      angular.alerts.info("You have been signed out due to inactivity.");
      this.$state.go("home");

    }, this.AUTH_TIMEOUT);
  }

  _checkAuthenticated() {
    return !this._isTokenExpired() && this.getAccessToken();
  }

  _isTokenExpired() {
    const oAuthTimestamp = this.StorageService.get('oAuthTimestamp');
    const now = new Date().getTime();

    if (now - oAuthTimestamp > this.AUTH_TIMEOUT) {
      this.clearTokens();
      return true;
    }

    return false;
  }
}

export default angular.module('fims.authService', [ storageService ])
  .service('AuthService', AuthService)
  .name;
