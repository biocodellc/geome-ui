import angular from 'angular';

const template = require('./resetPass.html');

class ResetPassController {
  constructor($location, $state, UserService) {
    'ngInject';

    this.$location = $location;
    this.$state = $state;
    this.UserService = UserService;
  }

  $onInit() {
    this.resetToken = this.$location.search().resetToken;
  }

  resetPassword() {
    // TODO use a different password strength meter
    const e = $('#pwindicator');
    if (e && !e.hasClass('pw-weak')) {
      this.UserService.resetPassword(this.password, this.resetToken).then(() =>
        angular.toaster.success('Successfully reset you password', {
          name: 'login',
          fn: () => this.$state.go('login'),
        }),
      );
    }
  }
}

export default {
  template,
  controller: ResetPassController,
};
