class ProjectMembersAddController {
  $onInit() {
    this.username = undefined;
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

export default angular.module('fims.projectExpeditions', [])
  .component('fimsProjectMembersAdd', fimsProjectMembersAdd)
  .name;
