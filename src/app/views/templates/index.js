import angular from 'angular';

import projects from '../../components/projects';
import files from '../../components/files';
import attributeDefinition from '../../components/attribute-definition';

import routing from './template.routes';
import TemplateService from "./TemplateService";

const DEFAULT_TEMPLATE = { name: 'DEFAULT' };

class TemplateCtrl {
  constructor(TemplateService) {
    'ngInject';

    this._config = undefined;
    this._templates = [];

    this.isAuthenticated = false;
    this.template = Object.assign({}, DEFAULT_TEMPLATE);
    this.templates = [ Object.assign({}, DEFAULT_TEMPLATE) ];
    this.sheetName = undefined;
    this.description = undefined;
    this.defAttribute = undefined;
    this.required = [];
    this.selected = [];
    this.worksheets = [];
    this.attributes = [];

    this.TemplateService = TemplateService;
  }

  $onChanges(changesObj) {
    if ('currentUser' in changesObj) {
      this.isAuthenticated = !!(this.currentUser);
    }

    if ('currentProject' in changesObj) {
      // TODO if not currentProject, redirect to home;
      this._config = this.currentProject.config;
      this._getTemplates();
      this._getWorksheets();
      this._getAttributes();
      this.description = this.currentProject.description;
      this.defAttribute = undefined;
    }
  }

  toggleSelected(attribute) {
    const i = this.selected.indexOf(attribute);

    // currently selected
    if (i > -1) {
      this.selected.splice(i, 1);
    } else {
      this.selected.push(attribute);
    }
  }

  sheetChange() {
    this._getAttributes();
    this._filterTemplates();
    this.template = Object.assign({}, DEFAULT_TEMPLATE);
  }

  templateChange() {
    if (angular.equals(this.template, DEFAULT_TEMPLATE)) {
      this.selected = this.required.concat(this._config.suggestedAttributes(this.sheetName));
    } else {
      this.selected = this.required.slice();

      Object.values(this.attributes)
        .reduce((result, attributes) => result.concat(attributes), [])
        .filter(a => this.template.attributeUris.includes(a.uri))
        .forEach(a => this.selected.push(a));
    }
  }

  canRemoveTemplate() {
    return this.template && !angular.equals(this.template, DEFAULT_TEMPLATE) &&
      this.template.user.userId === this.currentUser.userId;
  }

  generate() {
    const columns = this.selected.map(attribute => attribute.column);

    this.TemplateService.generate(this.currentProject.projectId, this.sheetName, columns);
  }

  _filterTemplates() {
    this.templates = [ DEFAULT_TEMPLATE ];

    this._templates.forEach((t) => {
      if (t.sheetName === this.sheetName) {
        this.templates.push(t);
      }
    })

  }

  _getTemplates() {
    this.TemplateService.all(this.currentProject.projectId)
      .then((response) => {
          this._templates = response.data;
          this._filterTemplates();
          this.templateChange();
        })
      .catch(angular.catcher("Failed to load templates"));
  }

  _getAttributes() {
    this.attributes = this._config.attributesByGroup(this.sheetName);
    this.required = this._config.requiredAttributes(this.sheetName);
  }

  _getWorksheets() {
    this.worksheets = this._config.worksheets();
    this.sheetName = this.worksheets[ 0 ];
  }
}


const fimsTemplates = {
  template: require('./templates.html'),
  controller: TemplateCtrl,
  bindings: {
    currentUser: "<",
    currentProject: "<",
  },
};

export default angular.module('fims.templates', [ projects, files, attributeDefinition ])
  .run(routing)
  .component('fimsTemplates', fimsTemplates)
  .service('TemplateService', TemplateService)
  .name;
