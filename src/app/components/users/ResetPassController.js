import angular from 'angular';


class ResetPassController {
  constructor($location, $sce, UserService) {
    this.resetToken = $location.search()[ 'resetToken' ];
    this.password = null;

    this.$sce = $sce;
    this.UserService = UserService;
  }

  resetPassword() {
    const e = $('#pwindicator');
    if (e && !e.hasClass('pw-weak')) {
      this.UserService.resetPassword(this.password, this.resetToken)
        .then(
          function () {
            angular.alerts.success(this.$sce.trustAsHtml("Successfully reset your password. Click <a ui-sref='login' href='/login' class='alert-link'>here</a> to login."));
          });
    }
  }
}

ResetPassController.$inject = [ '$location', '$sce', 'UserService', 'alerts' ];

export default ResetPassController;

