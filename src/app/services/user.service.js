import angular from 'angular';
import { EventEmitter } from 'events';
import User from '../models/User';

import config from '../utils/config';

const { restRoot } = config;

export const USER_CHANGED_EVENT = 'userChanged';

let currentUser;
class UserService extends EventEmitter {
  constructor($http, StorageService) {
    'ngInject';

    super();

    this.$http = $http;
    this.StorageService = StorageService;
  }

  currentUser() {
    return currentUser;
  }

  setCurrentUser(user) {
    currentUser = user ? new User(user) : undefined;
    this.emit(USER_CHANGED_EVENT, user);
    return currentUser;
  }

  all() {
    return this.$http
      .get(`${restRoot}users/`)
      .then(response => response.data.map(user => new User(user)))
      .catch(angular.catcher('Error loading users.'));
  }

  get(username) {
    return this.$http
      .get(`${restRoot}users/${username}`)
      .then(response => {
        // bug in angular ui router??? When app.run.js loadSession calls this,
        // and the auth request fails b/c accessToken has expired, a TargetState
        // object is passed here instead of $http response
        // if !response.status assume the request failed
        if (!response.status || response.status === 204) {
          return;
        }

        return new User(response.data);
      })
      .catch(angular.catcher('Error loading user.'));
  }

  create(user, inviteId) {
    return this.$http({
      method: 'POST',
      url: `${restRoot}users/${inviteId || ''}`,
      data: user,
      keepJson: true,
    }).catch(angular.catcher('Error creating user.'));
  }

  invite(email, projectId) {
    return this.$http
      .post(`${restRoot}users/invite`, {
        email,
        projectId,
      })
      .catch(angular.catcher('Error inviting user.'));
  }

  save(user) {
    return this.$http({
      method: 'PUT',
      url: `${restRoot}users/${user.username}`,
      data: user,
      keepJson: true,
    }).catch(angular.catcher('Error saving user.'));
  }

  updatePassword(username, currentPassword, newPassword) {
    return this.$http
      .put(`${restRoot}users/${username}/password`, {
        currentPassword,
        newPassword,
      })
      .catch(angular.catcher('Error updating password.'));
  }

  resetPassword(password, resetToken) {
    return this.$http
      .post(`${restRoot}users/reset`, {
        password,
        resetToken,
      })
      .catch(angular.catcher('Failed to reset password.'));
  }

  sendResetPasswordToken(username) {
    return this.$http.post(`${restRoot}users/${username}/sendResetToken`);
  }

  loadFromSession() {
    const username = this.StorageService.get('username');
    return this.get(username);
  }
}

export default angular
  .module('fims.userService', [])
  .service('UserService', UserService).name;
