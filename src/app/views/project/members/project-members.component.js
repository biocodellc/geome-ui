import angular from 'angular';

const template = require('./project-members.html');
const removeTemplate = require('./remove-member-confirmation.tpl.html');

class ProjectMembersController {
  constructor($state, $uibModal, ProjectMembersService, UserService) {
    'ngInject';

    this.$uibModal = $uibModal;
    this.$state = $state;
    this.ProjectMembersService = ProjectMembersService;
    this.UserService = UserService;
  }
  
  $onInit() {
  // this.loading = true;
   this.orderByList = [
      'username',
      'institution',
      'email',
      'firstName',
      'lastName',
    ];

    this.orderBy = this.orderByList[0];
  }

  handleInviteUser(email) {
    if (this.isMemberEmail(email)) {
      angular.toaster.error(
        'A user with the email is already a member of this project.',
      );
      return;
    }

    this.UserService.invite(email, this.currentProject.projectId).then(() =>
      angular.toaster(
        `${email} has been sent an invitation to create an account.`,
      ),
    );
  }

  isMemberEmail(email) {
    return !!this.members.find(m => m.email === email);
  }

  handleAddMember() {
    this.ProjectMembersService.add(
      this.currentProject.projectId,
      this.username,
    ).then(() => {
      this.username = undefined;
      angular.toaster.success('Successfully added user');
      this.$state.reload();
    });
  }

  remove(user) {
    const modal = this.$uibModal.open({
      template: removeTemplate,
      size: 'md',
      controller: RemoveMemberConfirmationController,
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: 'static',
      resolve: {
        username() {
          return user.username;
        },
      },
    });

    modal.result.then(() =>
      this.ProjectMembersService.remove(
        this.currentProject.projectId,
        user.username,
      ).then(() => this.$state.reload()),
    );
  }
}

class RemoveMemberConfirmationController {
  constructor($uibModalInstance, username) {
    'ngInject';

    this.username = username;
    this.remove = $uibModalInstance.close;
    this.cancel = $uibModalInstance.dismiss;
  }
}

export default {
  template,
  controller: ProjectMembersController,
  bindings: {
    members: '<',
    currentUser: '<',
    currentProject: '<',
  },
};
