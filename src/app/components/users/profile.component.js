import angular from 'angular';


class ProfileController {
  constructor(UserService) {
    'ngInject';

    this.UserService = UserService;
  }

  $onInit() {
    this.user = Object.assign({}, this.currentUser);
  }

  save() {
    this.UserService.save(this.user)
      .then(() => {
        this.onUserChange({ user: this.user });
        angular.alerts.success("Successfully saved your profile!")
      });
  }

  updatePassword() {
    this.UserService.updatePassword(this.user.username, this.currentPassword, this.newPassword)
      .then(() => {
        angular.alerts.success("Successfully saved your profile!");
        this.currentPassword = undefined;
        this.newPassword = undefined;
        this.verifyPassword = undefined;
      })
  }
}

export default {
  template: require('./profile.html'),
  controller: ProfileController,
  bindings: {
    currentUser: '<',
    onUserChange: '&'
  },
};
