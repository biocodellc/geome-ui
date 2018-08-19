import angular from 'angular';

const template = require('./templates.html');

const DEFAULT_TEMPLATE = { name: 'DEFAULT' };

class TemplateController {
  constructor($state, $mdDialog, TemplateService) {
    'ngInject';

    this.TemplateService = TemplateService;
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
      this.attributes = {};
      this.selected = {};
      this.getTemplates();
      this.getWorksheets();
      this.populateAttributesCache();
      this.description = this.currentProject.description;
      this.defAttribute = undefined;
      this.defWorksheet = undefined;
    }
  }

  selectAll(worksheet) {
    this.selected[worksheet] = Object.values(
      this.attributes[worksheet].attributes,
    ).reduce((result, group) => result.concat(group), []);
  }

  selectNone(worksheet) {
    this.selected[worksheet] = this.attributes[worksheet].required.slice();
  }

  saveConfig(ev) {
    const columns = this.selected[this.worksheet].map(
      attribute => attribute.column,
    );

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

  toggleSelected(worksheet, attribute) {
    const i = this.selected[worksheet].indexOf(attribute);

    // currently selected
    if (i > -1) {
      this.selected[worksheet].splice(i, 1);
    } else {
      this.selected[worksheet].push(attribute);
    }
  }

  sheetChange() {
    this.filterTemplates();
    this.template = Object.assign({}, DEFAULT_TEMPLATE);
    this.templateChange();
  }

  templateChange() {
    this.defAttribute = undefined;
    if (this.worksheet === 'Workbook') return;
    if (angular.equals(this.template, DEFAULT_TEMPLATE)) {
      this.selected[this.worksheet] = this.attributes[
        this.worksheet
      ].required.concat(this.projectConfig.suggestedAttributes(this.worksheet));
    } else {
      this.selected[this.worksheet] = this.attributes[
        this.worksheet
      ].required.slice();
      Object.values(this.attributes[this.worksheet])
        .reduce((result, attributes) => result.concat(attributes), [])
        .filter(a => this.template.columns.includes(a.column))
        .forEach(a => this.selected[this.worksheet].push(a));
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
    const templates =
      this.worksheet === 'Workbook'
        ? Object.keys(this.selected).reduce((accumulator, worksheet) => {
            if (this.selected[worksheet].length > 0) {
              accumulator.push({
                name: worksheet,
                columns: this.selected[worksheet].map(
                  attribute => attribute.column,
                ),
              });
            }
            return accumulator;
          }, [])
        : [
            {
              name: this.worksheet,
              columns: this.selected[this.worksheet].map(
                attribute => attribute.column,
              ),
            },
          ];

    this.loading = true;
    this.TemplateService.generate(this.currentProject.projectId, templates)
      .catch(() => {})
      .then(() => {
        this.loading = false;
      });
  }

  filterTemplates() {
    this.templates = this.allTemplates.filter(
      t => t.worksheet === this.selected,
    );
    this.templates.unshift(DEFAULT_TEMPLATE);
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
    if (this.worksheet === 'Workbook') return this.attributes;
    return { [this.worksheet]: this.attributes[this.worksheet] };
  }

  populateAttributesCache() {
    const blacklist = [
      'processed',
      'imageProcessingErrors',
      'img128',
      'img512',
      'img1024',
    ];

    this.attributes = this.projectConfig.entities.reduce(
      (accumulator, entity) => {
        const { worksheet } = entity;

        if (!worksheet) return accumulator;

        if (!this.selected[worksheet]) this.selected[worksheet] = [];

        // eslint-disable-next-line no-param-reassign
        accumulator[worksheet] = {
          attributes: this.projectConfig.attributesByGroup(worksheet),
          required: this.projectConfig.requiredAttributes(worksheet),
        };

        this.selected[worksheet] = this.selected[worksheet].concat(
          accumulator[worksheet].required,
          this.projectConfig.suggestedAttributes(worksheet),
        );

        // hack until we determine a better way to represent hidden & non template attributes in backend
        if (entity.type === 'Photo') {
          // eslint-disable-next-line no-param-reassign
          accumulator[worksheet].attributes = Object.entries(
            accumulator[worksheet].attributes,
          ).reduce(
            (result, [group, attributes]) =>
              Object.assign({}, result, {
                [group]: attributes.filter(a => !blacklist.includes(a.column)),
              }),
            {},
          );
        }

        return accumulator;
      },
      {},
    );
  }

  getWorksheets() {
    this.worksheets = this.projectConfig.worksheets();
    if (this.worksheets.length > 1 && !this.worksheets.includes('Workbook')) {
      this.worksheets.unshift('Workbook');
    }
    this.worksheet = this.worksheets[0];
  }

  define(worksheet, attribute) {
    this.defAttribute = attribute;
    this.defWorksheet = worksheet;
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
