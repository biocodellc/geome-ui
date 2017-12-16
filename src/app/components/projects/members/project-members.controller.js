import modalTemplate from './remove-member-confirmation.tpl.html';

export default class ProjectMembersController {
  constructor($scope, $state, $uibModal, UserService, ProjectMembersService, members) {
    "ngInject";

    this.$uibModal = $uibModal;
    this.$state = $state;
    this.ProjectMembersService = ProjectMembersService;
    this.orderByList = [ 'username', 'institution', 'email', 'firstName', 'lastName' ];

    this.orderBy = this.orderByList[ 0 ];
    this.members = members;
    this.user = UserService.currentUser;

    $scope.$on('$userChangeEvent', (event, user) => {
      this.user = user;
    });
  }

  remove(user) {
    const modal = this.$uibModal.open({
      template: modalTemplate,
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

