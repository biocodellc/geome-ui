import angular from 'angular';
import { EventEmitter } from 'events';

import storageService from './storage.service';

import config from '../utils/config';

const { restRoot, appRoot, authTimeout, fimsClientId } = config;

export const AUTH_ERROR_EVENT = 'authError';

let triedToRefresh = false;
let timeoutId;

class AuthService extends EventEmitter {
  constructor($state, $http, $timeout, StorageService) {
    'ngInject';

    super();

    this.$state = $state;
    this.StorageService = StorageService;
    this.$http = $http;
    this.$timeout = $timeout;
  }

  getAccessToken() {
    return this.StorageService.get('accessToken');
  }

  authenticate(username, password) {
    const data = {
      client_id: fimsClientId,
      redirect_uri: `${appRoot}/oauth`,
      grant_type: 'password',
      username,
      password,
    };

    return this.$http
      .post(`${restRoot}authenticationService/oauth/accessToken`, data)
      .then(({ data }) => this._authSuccess(data, username))
      .catch(response => {
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
    const refreshToken = this.StorageService.get('refreshToken');
    const username = this.StorageService.get('username');

    if (refreshToken && this._checkAuthenticated() && !triedToRefresh) {
      return this.$http
        .post(`${restRoot}authenticationService/oauth/refresh`, {
          client_id: fimsClientId,
          refresh_token: refreshToken,
        })
        .then(({ data }) => this._authSuccess(data, username))
        .catch(response => {
          this.$emit(AUTH_ERROR_EVENT);
          this.clearTokens();
          triedToRefresh = true;
          return Promise.reject(response);
        });
    }

    this.emit(AUTH_ERROR_EVENT);
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
      this.emit(AUTH_ERROR_EVENT);
      this.clearTokens();
      angular.alerts.info('You have been signed out due to inactivity.');
      this.$state.go('home');
    }, authTimeout);
  }

  _checkAuthenticated() {
    return !this._isTokenExpired() && this.getAccessToken();
  }

  _isTokenExpired() {
    const oAuthTimestamp = this.StorageService.get('oAuthTimestamp');
    const now = new Date().getTime();

    if (now - oAuthTimestamp > authTimeout) {
      this.clearTokens();
      return true;
    }

    return false;
  }
}

export default angular
  .module('fims.authService', [storageService])
  .service('AuthService', AuthService).name;
