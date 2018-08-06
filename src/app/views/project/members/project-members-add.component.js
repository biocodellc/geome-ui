import angular from 'angular';

const template = require('./project-members-add.html');

class ProjectMembersAddController {
  $onInit() {
    this.username = undefined;
  }

  inviteUser(email) {
    this.onInviteUser({ email });
  }
}

const fimsProjectMembersAdd = {
  template,
  controller: ProjectMembersAddController,
  bindings: {
    members: '<',
    currentProject: '<',
    users: '<',
    onInviteUser: '&',
    onAddMember: '&',
  },
};

export default angular
  .module('fims.projectMembersAdd', [])
  .component('fimsProjectMembersAdd', fimsProjectMembersAdd).name;
