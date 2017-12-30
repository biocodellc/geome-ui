import angular from 'angular';

import routing from "./project-members.routes";
import userService from '../../../services/user.service';
import ProjectMembersService from "./project-members.service";
import fimsProjectMembers from './project-members.component';
import fimsProjectMembersAdd from './project-members-add.component';

export default angular.module('fims.projectMembers', [ fimsProjectMembersAdd, userService ])
  .run(routing)
  .component('fimsProjectMembers', fimsProjectMembers)
  .service('ProjectMembersService', ProjectMembersService)
  .name;
