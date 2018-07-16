const template = require('./create.html');

class NewUserController {
  constructor($state, UserService, AuthService) {
    'ngInject';

    this.$state = $state;
    this.UserService = UserService;
    this.AuthService = AuthService;
  }

  $onInit() {
    this.user = {
      email: this.$state.params.email,
    };
  }

  save() {
    this.loading = true;
    this.UserService.create(this.$state.params.id, this.user)
      .then(() =>
        this.AuthService.authenticate(this.user.username, this.user.password),
      )
      .then(() => this.$state.go('about'))
      .finally(() => (this.loading = false));
  }
}

export default {
  template,
  controller: NewUserController,
};
