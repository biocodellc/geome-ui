import angular from 'angular';

const template = require('./templates.html');

const DEFAULT_TEMPLATE = { name: 'DEFAULT' };

class TemplateController {
  constructor($anchorScroll, TemplateService) {
    'ngInject';

    this.TemplateService = TemplateService;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    this._templates = [];
    this.template = Object.assign({}, DEFAULT_TEMPLATE);
    this.templates = [Object.assign({}, DEFAULT_TEMPLATE)];
  }

  $onChanges(changesObj) {
    if ('currentUser' in changesObj) {
      this.isAuthenticated = !!this.currentUser;
    }

    if (
      this.currentProject &&
      'currentProject' in changesObj &&
      changesObj.currentProject.previousValue !== this.currentProject
    ) {
      // TODO if not currentProject, redirect to home;
      this._config = this.currentProject.config;
      this.getTemplates();
      this.getWorksheets();
      this.getAttributes();
      this.description = this.currentProject.description;
      this.defAttribute = undefined;
    }
  }

  selectAll() {
    this.selected = Object.values(this.attributes).reduce(
      (result, group) => result.concat(group),
      [],
    );
  }

  selectNone() {
    this.selected = this.required.slice();
  }

  saveConfig() {
    // TODO finish this
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
    this.getAttributes();
    this.filterTemplates();
    this.template = Object.assign({}, DEFAULT_TEMPLATE);
  }

  templateChange() {
    if (angular.equals(this.template, DEFAULT_TEMPLATE)) {
      this.selected = this.required.concat(
        this._config.suggestedAttributes(this.sheetName),
      );
    } else {
      this.selected = this.required.slice();

      Object.values(this.attributes)
        .reduce((result, attributes) => result.concat(attributes), [])
        .filter(a => this.template.columns.includes(a.column))
        .forEach(a => this.selected.push(a));
    }
  }

  canRemoveTemplate() {
    return (
      this.template &&
      !angular.equals(this.template, DEFAULT_TEMPLATE) &&
      this.template.user.userId === this.currentUser.userId
    );
  }

  generate() {
    const columns = this.selected.map(attribute => attribute.column);

    this.TemplateService.generate(
      this.currentProject.projectId,
      this.sheetName,
      columns,
    );
  }

  filterTemplates() {
    this.templates = this._templates.filter(
      t => t.sheetName === this.sheetName,
    );
    this.templates.splice(0, 1, DEFAULT_TEMPLATE);
  }

  getTemplates() {
    this.TemplateService.all(this.currentProject.projectId)
      .then(response => {
        this._templates = response.data;
        this.filterTemplates();
        this.templateChange();
      })
      .catch(angular.catcher('Failed to load templates'));
  }

  getAttributes() {
    this.attributes = this._config.attributesByGroup(this.sheetName);
    this.required = this._config.requiredAttributes(this.sheetName);
  }

  getWorksheets() {
    this.worksheets = this._config.worksheets();
    this.sheetName = this.worksheets[0];
  }

  define(attribute) {
    this.defAttribute = attribute;
    this.$anchorScroll('definition'); // scroll to definition
  }
}

export default {
  template,
  controller: TemplateController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
  },
};
