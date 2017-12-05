class LoginController {
  constructor($state, UserService, LoadingModal, exception, alerts) {
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
    this.userService.sendResetPasswordToken(login.credentials.username)
      .then(
        function () {
          this.alerts.success("Successfully sent reset password token. Check your email for further instructions.");
        },
        this.exception.catcher("Error sending reset password token"),
      );
  }

  submit() {
    this.alerts.removeTmp();
    this.loadingModal.open();
    this.userService.signIn(login.credentials.username, login.credentials.password)
      .then(function () {
        const params = this.state.params;
        if (params.nextState && params.nextState !== "login") {
          return this.state.go(params.nextState, params.nextStateParams);
        } else {
          return this.state.go('home');
        }
      })
      .finally(function () {
          this.loadingModal.close();
        },
      );
  }
}

LoginController.$inject = [ '$state', 'UserService', 'LoadingModal', 'exception', 'alerts' ];

export default LoginController;
