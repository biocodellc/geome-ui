import angular from 'angular';

class ResetPassController {
  constructor($location, $sce, UserService) {
    'ngInject';

    this.$location = $location;
    this.$sce = $sce;
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
        angular.alerts.success(
          this.$sce.trustAsHtml(
            "Successfully reset your password. Click <a ui-sref='login' href='/login' class='alert-link'>here</a> to login.",
          ),
        ),
      );
    }
  }
}

export default {
  template: require('./resetPass.html'),
  controller: ResetPassController,
};
