import angular from 'angular';

const template = require('./register.html');

class RegisterController {
  constructor($state, UserService, AuthService) {
    'ngInject';

    this.state = $state;
    this.UserService = UserService;
    this.AuthService = AuthService;
  }

  $onInit() {
    this.user = {
      username: undefined,
      password: undefined,
      email: undefined,
      institution: undefined,
      firstName: undefined,
      lastName: undefined,
    };
  }

  async register() {
    this.loading = true;
    try {
      const user = await this.UserService.create(this.user);
      await this.AuthService.authenticate(
        this.user.username,
        this.user.password,
      );
      this.UserService.setCurrentUser(user);
      this.state.go('create-project', {}, { reload: true, inherit: false });
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
};
