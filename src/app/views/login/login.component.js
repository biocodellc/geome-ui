import angular from 'angular';


class LoginController {
  constructor($state, UserService, LoadingModal) {
    'ngInject';

    this.state = $state;
    this.userService = UserService;
    this.loadingModal = LoadingModal;
  }

  $onInit() {
    this.resetPass = false;
    this.credentials = {
      username: '',
      password: '',
    };
  }

  resetPassword() {
    this.userService.sendResetPasswordToken(this.credentials.username)
      .then(() =>
        angular.alerts.success("Successfully sent reset password token. Check your email for further instructions."))
      .catch(angular.catcher("Error sending reset password token"));
  }

  submit() {
    angular.alerts.removeTmp();
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

export default {
  template: require('./login.html'),
  controller: LoginController
};
