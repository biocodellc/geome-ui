import angular from 'angular';

import routing from "./project-members.routes";
import ProjectMembersService from "./project-members.service";
import fimsProjectMembers from './project-members.component';
import fimsProjectMembersAdd from './project-members-add.component';

export default angular.module('fims.projectMembers', [ fimsProjectMembersAdd ])
  .run(routing)
  .component('fimsProjectMembers', fimsProjectMembers)
  .service('ProjectMembersService', ProjectMembersService)
  .name;
