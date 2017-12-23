self = undefined;
class ProjectMembersAddController {
  $onInit() {
    this.username = undefined;
  }

  inviteUser(email) {
    this.onInviteUser({ email: email});
  }
}

const fimsProjectMembersAdd = {
  template: require('./project-members-add.html'),
  controller: ProjectMembersAddController,
  bindings: {
    members: '<',
    currentProject: '<',
    users: '<',
    onInviteUser: '&',
    onAddMember: '&',
  },
};

export default angular.module('fims.projectMembersAdd', [])
  .component('fimsProjectMembersAdd', fimsProjectMembersAdd)
  .name;
