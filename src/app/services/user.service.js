import angular from 'angular';
import { EventEmitter } from 'events';
import User from '../models/User';

export const USER_CHANGED_EVENT = 'userChanged';

let currentUser = undefined;
class UserService extends EventEmitter {
  constructor($http, StorageService, REST_ROOT) {
    'ngInject';
    super();

    this.$http = $http;
    this.StorageService = StorageService;
    this.REST_ROOT = REST_ROOT;
  }

  currentUser() {
    return currentUser;
  }

  setCurrentUser(user) {
    currentUser = (user) ? new User(user) : undefined;
    this.emit(USER_CHANGED_EVENT, user);
    return currentUser;
  }

  all() {
    return this.$http.get(this.REST_ROOT + 'users/')
      .then((response) => response.data.map(user => new User(user)))
      .catch(angular.catcher("Error loading users."));
  }

  get(username) {
    return this.$http.get(this.REST_ROOT + 'users/' + username)
      .then((response) => {
        if (response.status === 204) {
          return;
        }

        return new User(response.data);
      })
      .catch(angular.catcher("Error loading user."));
  }

  create(inviteId, user) {
    return this.$http(
      {
        method: 'POST',
        url: this.REST_ROOT + 'users?id=' + inviteId,
        data: user,
        keepJson: true,
      })
      .catch(angular.catcher("Error creating user."));
  }

  invite(email, projectId) {
    return this.$http.post(this.REST_ROOT + 'users/invite', { email: email, projectId: projectId })
      .catch(angular.catcher("Error inviting user."));
  }

  save(user) {
    return this.$http(
      {
        method: 'PUT',
        url: this.REST_ROOT + 'users/' + user.username,
        data: user,
        keepJson: true,
      },
    ).catch(angular.catcher("Error saving user."));
  }

  updatePassword(username, currentPassword, newPassword) {
    return this.$http.put(this.REST_ROOT + 'users/' + username + '/password', {
        currentPassword: currentPassword,
        newPassword: newPassword,
      },
    ).catch(angular.catcher("Error updating password."));
  }

  resetPassword(password, resetToken) {
    return this.$http.post(this.REST_ROOT + "users/resetPassword", { password: password, resetToken: resetToken })
      .catch(angular.catcher("Failed to reset password."));
  }

  sendResetPasswordToken(username) {
    return this.$http.get(this.REST_ROOT + "users/" + username + "/sendResetToken");
  }

  loadFromSession() {
    const username = this.StorageService.get('username');
    return this.get(username);
  }
}

export default angular.module('fims.userService', [])
  .service('UserService', UserService)
  .name;
