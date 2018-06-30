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
      .then(user => this.AuthService.authenticate(user.username, user.password))
      .then(() => $state.go('home'))
      .finally(() => this.loading = false)
  }
}

export default {
  template: require('./profile.html'/*'./create.html'*/),
  controller: NewUserController,
};
