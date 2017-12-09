export default class ProjectMembersAddController {
  constructor(UserService, ProjectMembersService, alerts, members, project) {
    "ngInject";

    this.UserService = UserService;
    this.ProjectMembersService = ProjectMembersService;
    this.alerts = alerts;
    this.members = members;
    this.project = project;

    this._allUsers = [];

    this.users = [];
    this.username = undefined;
    this.removeAlerts = alerts.removeTmp;
    this.inviteUser = inviteUser;
    this.add = add;

    this._init();
  }

  _init() {
    this.UserService.all()
      .then((users) => {
        this._allUsers = users;
        this._filterUsers();
      });
  }

  add() {
    this.removeAlerts();
    this.ProjectMembersService.add(this.username)
      .then(() => {
        this.username = undefined;
        this.alerts.success("Successfully added user");
        this._filterUsers();
      });
  }

  inviteUser(email) {
    if (this._isMemberEmail(email)) {
      this.alerts.error('A user with the email is already a member of this project.');
      return;
    }

    this.alerts.removeTmp();
    this.UserService.invite(email, project.projectId)
      .then(() => this.alerts.success(email + ' has been sent an invitation to create an account.'));
  }

  _isMemberEmail(email) {
    const found = this.members.find(m => m.email === email);

    return !(found);
  }

  _filterUsers() {
    this.users = this._allUsers
      .filter(u => this.members.findIndex(m => u.username === m.username) > -1)
      .map(u => ({
        // only keep keys we are interested in. This allows us to use $ in the ui-select $filter to filter
        // users using the search term on all properties
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        institution: u.institution,
      }));
  }
}
