import angular from 'angular';

const template = require('./register.html');

class RegisterController {
  constructor($state, $location, UserService, AuthService) {
    'ngInject';

    this.state = $state;
    this.UserService = UserService;
    this.AuthService = AuthService;
    this.$location = $location;
  }

  $onInit() {
    const { email, inviteId } = this.$location.search();
    if (inviteId) this.inviteId = inviteId;
    this.user = {
      username: undefined,
      password: undefined,
      email,
      institution: undefined,
      firstName: undefined,
      lastName: undefined,
    };
  }

  async register() {
    this.loading = true;
    try {
      const response = await this.UserService.create(this.user, this.inviteId);
      const user = response.data;
      await this.AuthService.authenticate(
        this.user.username,
        this.user.password,
      );
      this.UserService.setCurrentUser(user);
      this.state.go(
        this.inviteId ? 'overview' : 'create-project',
        {},
        { reload: true, inherit: false },
      );
    } catch (e) {
      angular.catcher('An error occurred creating your account.')(e);
    } finally {
      this.loading = false;
    }
  }
}

export default {
  template,
  controller: RegisterController,
  bindings: {
    layout: '@',
  },
};
