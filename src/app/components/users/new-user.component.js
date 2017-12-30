class NewUserController {
  constructor($state, UserService, AuthService, LoadingModal) {
    'ngInject';

    this.$state = $state;
    this.UserService = UserService;
    this.AuthService = AuthService;
    this.LoadingModal = LoadingModal;
  }

  $onInit() {
    this.user = {
      email: this.$state.params.email,
    };
  }

  save() {
    this.LoadingModal.open();
    this.UserService.create(this.$state.params.id, this.user)
      .then((user) => this.AuthService.authenticate(user.username, user.password))
      .then(() => $state.go('home'))
      .finally(() => this.LoadingModal.close());
  }
}

export default {
  template: require('./profile.html'),
  controller: NewUserController,
};
