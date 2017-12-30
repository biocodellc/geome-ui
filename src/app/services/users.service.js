import angular from 'angular';
import User from '../models/User';

let currentUser = undefined;

class UserService {
  constructor($http, REST_ROOT) {
    'ngInject';

    this.$http = $http;
    this.REST_ROOT = REST_ROOT;
  }

  /**
   * this should only be used in ui-router hooks
   */
  currentUser() {
    return currentUser;
  }

  setCurrentUser(user) {
    currentUser = (user) ? new User(user) : undefined;
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
}

export default angular.module('fims.userService', [])
  .service('UserService', UserService)
  .name;
