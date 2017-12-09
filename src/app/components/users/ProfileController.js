class ProfileController {
  constructor(UserService, alerts) {

    this.user = UserService.currentUser;
    this.currentPassword = undefined;
    this.newPassword = undefined;
    this.verifyPassword = undefined;

    this.UserService = UserService;
    this.alerts = alerts;
  }

  save() {
    this.UserService.save(this.user)
      .then(() => this.alerts.success("Successfully saved your profile!"));
  }

  updatePassword() {
    this.UserService.updatePassword(this.user.username, this.currentPassword, this.newPassword)
      .then(() => {
        this.alerts.success("Successfully saved your profile!");
        this.currentPassword = undefined;
        this.newPassword = undefined;
        this.verifyPassword = undefined;
      })
  }
}

ProfileController.$inject = [ 'UserService', 'alerts' ];

export default ProfileController;
