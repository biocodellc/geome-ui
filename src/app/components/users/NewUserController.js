class NewUserController {
  constructor($state, UserService, LoadingModal) {

    this.user = {
      email: $state.params.email,
    };

    this.verifyPassword = undefined;

    this.$state = $state;
    this.UserService = UserService;
    this.LoadingModal = LoadingModal;
  }

  save() {
    this.LoadingModal.open();
    this.UserService.create(this.$state.params.id, this.user)
      .then(() => $state.go('home'))
      .finally(() => this.LoadingModal.close());
  }
}

NewUserController.$inject = [ '$state', 'UserService', 'LoadingModal' ];

export default NewUserController;
