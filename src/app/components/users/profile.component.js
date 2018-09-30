import angular from 'angular';

const template = require('./profile.html');

class ProfileController {
  constructor(UserService) {
    'ngInject';

    this.UserService = UserService;
  }

  $onInit() {
    this.user = Object.assign({}, this.currentUser);
  }

  save() {
    this.UserService.save(this.user).then(() => {
      this.UserService.setCurrentUser(this.user);
      angular.toaster.success('Successfully saved your profile!');
    });
  }

  updatePassword() {
      this.UserService.updatePassword(
        this.user.username,
        this.currentPassword,
        this.newPassword,
      ).then(() => {
        angular.toaster.success('Successfully saved your profile!');
        this.currentPassword = undefined;
        this.newPassword = undefined;
        this.verifyPassword = undefined;
      });
  }
}

export default {
  template,
  controller: ProfileController,
  bindings: {
    currentUser: '<',
  },
};
