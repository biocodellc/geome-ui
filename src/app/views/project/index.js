import angular from 'angular';
import select from 'ui-select';
import modal from 'angular-ui-bootstrap/src/modal';

// dndLists doesn't export anything. we import here so webpack will bundle/load the file
// then we use the angular module loader to list as a dependency
import 'angular-drag-and-drop-lists';
import router from '../../utils/router';
import exceptions from '../../components/exceptions';

import routing from "./project.routes";
import requiresProject from './projectRequired.hook';
import run from "./projects.run";
import config from "./projects.config";
import Projects from "./project.service";
import ProjectFactory from "./projectFactory";
import ProjectMembersService from "./members/project-members.service";
import ProjectConfigService from "./config/ProjectConfigService";
import editPopoverTemplate from "./config/edit-popover-template-popup.directive";
import ruleMetadata from "./config/rule-metadata.directive";
// import {  editEntity } from "./config/entities/editable-entity.directive";
import { editableAttribute, editAttribute } from "./config/editable-attribute.directive";
import { editableField, editField } from "./config/editable-field.directive";
import { editableList, editList } from "./config/editable-list.directive";
import { editableRule, editRule } from "./config/editable-rule.directive";

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
  'dndLists',
  fimsProjectSettings,
  fimsProjectExpeditions,
  fimsProjectMembers,
  fimsProjectConfig,
];

//TODO finish the config dir refactor
export default angular.module('fims.project', dependencies)
  .config(config)
  .run(run)
  .run(routing) // need to declare in run block. otherwise $transitions is not available
  .run(requiresProject)
  .component('fimsProject', fimsProject)
  .service('Projects', Projects)
  .service('ProjectFactory', ProjectFactory)
  .service('ProjectMembersService', ProjectMembersService)
  .service('ProjectConfigService', ProjectConfigService)
  .directive('editPopoverTemplatePopup', editPopoverTemplate)
  .directive('ruleMetadata', ruleMetadata)
  // .directive('editEntity', editEntity)
  // .directive('editableEntity', editableEntity)
  .directive('editAttribute', editAttribute)
  .directive('editableAttribute', editableAttribute)
  .directive('editField', editField)
  .directive('editableField', editableField)
  .directive('editList', editList)
  .directive('editableList', editableList)
  .directive('editRule', editRule)
  .directive('editableRule', editableRule)
  .name;
