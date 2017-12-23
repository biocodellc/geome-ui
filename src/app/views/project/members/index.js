import fimsProjectMembersAdd from './project-members-add.component';
import routing from "./routes";

class ProjectMembersController {
  constructor($state, $uibModal, ProjectMembersService, UserService, alerts) {
    "ngInject";

    this.$uibModal = $uibModal;
    this.$state = $state;
    this.ProjectMembersService = ProjectMembersService;
    this.UserService = UserService;
    this.alerts = alerts;
  }

  $onInit() {
    this.orderByList = [ 'username', 'institution', 'email', 'firstName', 'lastName' ];
    this.orderBy = this.orderByList[ 0 ];
  }

  handleInviteUser(email) {
    if (this.isMemberEmail(email)) {
      this.alerts.error('A user with the email is already a member of this project.');
      return;
    }

    this.alerts.removeTmp();
    this.UserService.invite(email, this.currentProject.projectId)
      .then(() => this.alerts.success(email + ' has been sent an invitation to create an account.'));

  }

  isMemberEmail(email) {
    return !!(this.members.find(m => m.email === email));
  }

  handleAddMember(username) {
    this.alerts.removeTmp();
    this.ProjectMembersService.add(this.username)
      .then(() => {
        this.username = undefined;
        this.alerts.success("Successfully added user");
        this.$state.reload();
      });
  }

  remove(user) {
    const modal = this.$uibModal.open({
      template: require('./remove-member-confirmation.tpl.html'),
      size: 'md',
      controller: RemoveMemberConfirmationController,
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: 'static',
      resolve: {
        username: function () {
          return user.username;
        },
      },
    });

    modal.result.then(() =>
      this.ProjectMembersService.remove(user.username)
        .then(() => this.$state.reload()),
    );
  }
}

class RemoveMemberConfirmationController {
  constructor($uibModalInstance, username) {
    "ngInject";

    this.username = username;
    this.remove = $uibModalInstance.close;
    this.cancel = $uibModalInstance.dismiss;
  }
}

const fimsProjectMembers = {
  template: require('./project-members.html'),
  controller: ProjectMembersController,
  bindings: {
    members: '<',
    currentUser: '<',
  },
};

export default angular.module('fims.projectMembers', [ fimsProjectMembersAdd ])
  .run(routing)
  .component('fimsProjectMembers', fimsProjectMembers)
  .name;
