import angular from 'angular';
import select from 'ui-select';
import modal from 'angular-ui-bootstrap/src/modal';

// dndLists doesn't export anythin. we import here so webpack will bundle/load the file
// then we use the angular module loader to list as a dependency
import 'angular-drag-and-drop-lists';
import router from '../../utils/router';
import exceptions from '../exceptions';

import routing from "./project.routes";
import run from "./projects.run";
import config from "./projects.config";
import ProjectService from "./project.service";
import ProjectFactory from "./projectFactory";
import ProjectMembersService from "./members/project-members.service";
import ProjectConfigService from "./config/ProjectConfigService";
import editPopoverTemplate from "./config/edit-popover-template-popup.directive";
import ruleMetadata from "./config/rule-metadata.directive";
import { editableEntity, editEntity } from "./config/editable-entity.directive";
import { editableAttribute, editAttribute } from "./config/editable-attribute.directive";
import { editableField, editField } from "./config/editable-field.directive";
import { editableList, editList } from "./config/editable-list.directive";
import { editableRule, editRule } from "./config/editable-rule.directive";


//TODO finish the config dir refactor
export default angular.module('fims.projects', [ modal, router, exceptions, select, 'dndLists' ])
  .config(config)
  .run(run)
  .run(routing) // need to declare in run block. otherwise $transitions is not available
  .service('ProjectService', ProjectService)
  .service('ProjectFactory', ProjectFactory)
  .service('ProjectMembersService', ProjectMembersService)
  .service('ProjectConfigService', ProjectConfigService)
  .directive('editPopoverTemplatePopup', editPopoverTemplate)
  .directive('ruleMetadata', ruleMetadata)
  .directive('editEntity', editEntity)
  .directive('editableEntity', editableEntity)
  .directive('editAttribute', editAttribute)
  .directive('editableAttribute', editableAttribute)
  .directive('editField', editField)
  .directive('editableField', editableField)
  .directive('editList', editList)
  .directive('editableList', editableList)
  .directive('editRule', editRule)
  .directive('editableRule', editableRule)
  .name;
