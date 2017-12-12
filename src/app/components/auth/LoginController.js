class LoginController {
  constructor($state, UserService, LoadingModal, exception, alerts) {
    'ngInject';
    this.resetPass = false;
    this.credentials = {
      username: '',
      password: '',
    };

    this.state = $state;
    this.userService = UserService;
    this.loadingModal = LoadingModal;
    this.exception = exception;
    this.alerts = alerts;
  }

  resetPassword() {
    this.userService.sendResetPasswordToken(this.credentials.username)
      .then(() =>
          this.alerts.success("Successfully sent reset password token. Check your email for further instructions."))
      .catch(this.exception.catcher("Error sending reset password token"));
  }

  submit() {
    this.alerts.removeTmp();
    this.loadingModal.open();
    this.userService.signIn(this.credentials.username, this.credentials.password)
      .then(() => {
        const params = this.state.params;
        if (params.nextState && params.nextState !== "login") {
          return this.state.go(params.nextState, params.nextStateParams);
        } else {
          return this.state.go('home');
        }
      })
      .finally(() => this.loadingModal.close());
  }
}

export default LoginController;
