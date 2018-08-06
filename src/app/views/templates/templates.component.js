import angular from 'angular';

const template = require('./templates.html');

const DEFAULT_TEMPLATE = { name: 'DEFAULT' };

class TemplateController {
  constructor($anchorScroll, $state, $mdDialog, TemplateService) {
    'ngInject';

    this.TemplateService = TemplateService;
    this.$anchorScroll = $anchorScroll;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
  }

  $onInit() {
    this.loading = true;
    this.allTemplates = [];
    this.template = Object.assign({}, DEFAULT_TEMPLATE);
    this.templates = [Object.assign({}, DEFAULT_TEMPLATE)];

    if (!this.currentProject) this.$state.go('about');
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
      this.projectConfig = this.currentProject.config;
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

  saveConfig(ev) {
    const columns = this.selected.map(attribute => attribute.column);

    const prompt = this.$mdDialog
      .prompt()
      .title('What would you like to name your template?')
      .placeholder('Template name')
      .ariaLabel('Template name')
      .targetEvent(ev)
      .required(true)
      .ok('Save')
      .cancel('Cancel');

    this.$mdDialog
      .show(prompt)
      .then(templateName => {
        this.loading = true;
        return this.TemplateService.save(
          this.currentProject.projectId,
          templateName,
          this.worksheet,
          columns,
        );
      })
      .then(({ data }) => {
        this.allTemplates.push(data);
        this.template = data;
        this.filterTemplates();
        this.templateChange();
      })
      .catch(() => {})
      .then(() => {
        this.loading = false;
      });
  }

  removeConfig(ev) {
    const confirm = this.$mdDialog
      .confirm()
      .title('Are you sure you want to delete this template?')
      .ariaLabel('Remove template')
      .targetEvent(ev)
      .ok('Delete')
      .cancel('Cancel');

    this.$mdDialog
      .show(confirm)
      .then(() => {
        this.loading = true;
        return this.TemplateService.delete(
          this.currentProject.projectId,
          this.template.name,
        );
      })
      .then(() => {
        const i = this.allTemplates.findIndex(
          t => t.name === this.template.name,
        );
        if (i > -1) {
          this.allTemplates.splice(i, 1);
        }
        this.template = Object.assign({}, DEFAULT_TEMPLATE);
        this.filterTemplates();
        this.templateChange();
      })
      .catch(() => {})
      .then(() => {
        this.loading = false;
      });
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
    this.templateChange();
  }

  templateChange() {
    this.defAttribute = undefined;
    if (angular.equals(this.template, DEFAULT_TEMPLATE)) {
      this.selected = this.required.concat(
        this.projectConfig.suggestedAttributes(this.worksheet),
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

    this.loading = true;
    this.TemplateService.generate(
      this.currentProject.projectId,
      this.worksheet,
      columns,
    )
      .catch(() => {})
      .then(() => {
        this.loading = false;
      });
  }

  filterTemplates() {
    this.templates = this.allTemplates.filter(
      t => t.worksheet === this.worksheet,
    );
    this.templates.splice(0, 1, DEFAULT_TEMPLATE);
  }

  getTemplates() {
    this.TemplateService.all(this.currentProject.projectId)
      .then(response => {
        this.allTemplates = response.data;
        this.filterTemplates();
        this.templateChange();
      })
      .catch(angular.catcher('Failed to load templates'))
      .then(() => {
        this.loading = false;
      });
  }

  getAttributes() {
    this.attributes = this.projectConfig.attributesByGroup(this.worksheet);
    this.required = this.projectConfig.requiredAttributes(this.worksheet);

    const hasPhotoEntity = this.projectConfig.entities.some(
      e => e.type === 'Photo' && e.worksheet === this.worksheet,
    );

    // hack until we determine a better way to represent hidden & non template attributes in backend
    if (hasPhotoEntity) {
      const blacklist = [
        'processed',
        'imageProcessingErrors',
        'img128',
        'img512',
        'img1024',
      ];

      this.attributes = Object.entries(this.attributes).reduce(
        (result, [group, attributes]) =>
          Object.assign({}, result, {
            [group]: attributes.filter(a => !blacklist.includes(a.column)),
          }),
        {},
      );
    }
  }

  getWorksheets() {
    this.worksheets = this.projectConfig.worksheets();
    this.worksheet = this.worksheets[0];
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
