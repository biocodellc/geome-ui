import angular from 'angular';
import select from 'ui-select';
import 'ui-select/dist/select.min.css';
import sanitize from 'angular-sanitize';
import modal from 'angular-ui-bootstrap/src/modal';

// dndLists doesn't export anything. we import here so webpack will bundle/load the file
// then we use the angular module loader to list as a dependency
import 'angular-drag-and-drop-lists';
import router from '../../utils/router';
import exceptions from '../../components/exceptions';

import routing from "./project.routes";
import requiresProject from './projectRequired.hook';
import projectAdmin from './projectAdmin.hook'
import run from "./projects.run";
import config from "./projects.config";
import Projects from "./project.service";
import ProjectFactory from "./projectFactory";
import ProjectMembersService from "./members/project-members.service";
import ProjectConfigService from "./config/ProjectConfigService";
import confirmation from '../../utils/delete-confirmation';

import fimsProjectSettings from './project-settings';
import fimsProjectExpeditions from './project-expeditions';
import fimsProjectMembers from './members';
import fimsProjectConfig from './config';

export const CACHED_PROJECT_EVENT = '$cachedProjectEvent';

class ProjectCtrl {
  constructor($state, Projects, alerts) {
    'ngInject';
    this.$state = $state;
    this.Projects = Projects;
    this.alerts = alerts;
  }

  handleProjectUpdate(project) {
    if (!angular.equals(this.currentProject, project)) {
      this.Projects.update(project)
        .then(({ data }) => {
          this.alerts.success("Successfully updated!");
          return this.Projects.setCurrentProject(data);
        })
        .then(() => this.$state.reload());
    } else {
      this.alerts.success("Successfully updated!");
    }
  }

}

const fimsProject = {
  template: require('./project.html'),
  controller: ProjectCtrl,
  bindings: {
    currentProject: '<',
    onProjectChange: '&',
  },
};

const dependencies = [
  modal,
  router,
  exceptions,
  select,
  sanitize,
  'dndLists',
  confirmation,
  fimsProjectSettings,
  fimsProjectExpeditions,
  fimsProjectMembers,
  fimsProjectConfig,
];

export default angular.module('fims.project', dependencies)
  .config(config)
  .run(run)
  .run(routing) // need to declare in run block. otherwise $transitions is not available
  .run(requiresProject)
  .run(projectAdmin)
  .component('fimsProject', fimsProject)
  .service('Projects', Projects)
  .service('ProjectFactory', ProjectFactory)
  .service('ProjectMembersService', ProjectMembersService)
  .service('ProjectConfigService', ProjectConfigService)
  .name;
