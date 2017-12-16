import User from './User';

export default class UserService {
  constructor($rootScope, $http, $timeout, $state, exception, alerts, AuthService, REST_ROOT) {
    'ngInject';

    this._loading = false;
    this.currentUser = undefined;

    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$timeout = $timeout;
    this.$state = $state;
    this.exception = exception;
    this.alerts = alerts;
    this.AuthService = AuthService;
    this.REST_ROOT = REST_ROOT;

    $rootScope.$on('$userRefreshFailedEvent', () => this.signOut());
    $rootScope.$on('$authTimeoutEvent', () => this._authTimeout());
  }


  signIn(username, password) {
    return this.AuthService.authenticate(username, password)
      .then(() => this._fetchUser())
      .catch(this.exception.catcher("Error during authentication."));
  }

  signOut() {
    this.currentUser = undefined;
    this.AuthService.clearTokens();
    this.$rootScope.$broadcast('$logoutEvent');
  }

  loadUserFromSession() {
    if (this.AuthService.getAccessToken()) {
      this._fetchUser();
    }
  }

  /**
   * Returns a Promise that is resolved when the user loads, or after 5s. If the user is loaded,
   * the promise will resolve immediately. The promise will be rejected if there is no user loaded.
   */
  waitForUser() {
    if (this._loading) {
      return new Promise((resolve, reject) => {
        this.$rootScope.$on('$userChangeEvent', function (event, user) {
          resolve(user);
        });

        // set a timeout in-case the user takes too long to load
        this.$timeout(() => {
          if (this.currentUser) {
            resolve(this.currentUser);
          } else {
            reject();
          }
        }, 5000, false);
      });
    } else if (this.currentUser) {
      return Promise.resolve(this.currentUser);
    } else {
      return Promise.reject();
    }
  }

  all() {
    return this.$http.get(this.REST_ROOT + 'users/')
      .then((response) => response.data.map(user => new User(user)))
      .catch(this.exception.catcher("Error loading users."));
  }

  get(username) {
    return this.$http.get(this.REST_ROOT + 'users/' + username)
      .then(({ data }) => new User(data))
      .catch(this.exception.catcher("Error loading user."));
  }

  create(inviteId, user) {
    return this.$http(
      {
        method: 'POST',
        url: this.REST_ROOT + 'users?id=' + inviteId,
        data: user,
        keepJson: true,
      },
    // need to authenticate so we can get an accessToken
    ).then(() => this.signIn(user.username, user.password))
      .catch(this.exception.catcher("Error creating user."));
  }

  invite(email, projectId) {
    return this.$http.post(this.REST_ROOT + 'users/invite', { email: email, projectId: projectId })
      .catch(this.exception.catcher("Error inviting user."));
  }

  save(user) {
    return this.$http(
      {
        method: 'PUT',
        url: this.REST_ROOT + 'users/' + user.username,
        data: user,
        keepJson: true,
      },
    ).catch(this.exception.catcher("Error saving user."));
  }

  updatePassword(username, currentPassword, newPassword) {
    return this.$http.put(this.REST_ROOT + 'users/' + username + '/password', {
        currentPassword: currentPassword,
        newPassword: newPassword,
      },
    ).catch(this.exception.catcher("Error updating password."));
  }

  resetPassword(password, resetToken) {
    return this.$http.post(this.REST_ROOT + "users/resetPassword", { password: password, resetToken: resetToken })
      .catch(this.exception.catcher("Failed to reset password."));
  }

  sendResetPasswordToken(username) {
    return this.$http.get(this.REST_ROOT + "users/" + username + "/sendResetToken");
  }

  _fetchUser() {
    this._loading = true;
    return this.$http.get(this.REST_ROOT + 'users/profile')
      .then((response) => {
        const user = response.data;
        this._loading = false;
        if (user) {
          return this._setUser(user);
        }
      }, (response) => {
        this._loading = false;
        this.exception.catcher("Failed to load user.")(response);
      });
  }

  _setUser(user) {
    this.currentUser = new User(user);
    this.$rootScope.$broadcast("$userChangeEvent", this.currentUser);
  }

  _authTimeout() {
    this.signOut();
    this.alerts.info("You have been signed out due to inactivity.");
    this.$state.go("home");
  }
}
