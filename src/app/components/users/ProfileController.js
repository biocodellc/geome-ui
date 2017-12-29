import angular from 'angular';


export default class ProfileController {
  constructor(UserService) {
    'ngInject';

    this.user = UserService.currentUser;
    this.currentPassword = undefined;
    this.newPassword = undefined;
    this.verifyPassword = undefined;

    this.UserService = UserService;
  }

  save() {
    this.UserService.save(this.user)
      .then(() => angular.alerts.success("Successfully saved your profile!"));
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
