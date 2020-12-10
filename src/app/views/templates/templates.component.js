import angular from 'angular';

const template = require('./templates.html');
const definitionTemplate = require('./definition-dialog.html');

const DEFAULT_TEMPLATE = { name: 'DEFAULT' };

class TemplateController {
  constructor($scope, $state, $mdDialog, TemplateService, $mdMedia) {
    'ngInject';

    this.$scope = $scope;
    this.TemplateService = TemplateService;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.$mdMedia = $mdMedia;
  }

  $onInit() {
    this.allTemplates = [];
    this.template = Object.assign({}, DEFAULT_TEMPLATE);
    this.templates = [Object.assign({}, DEFAULT_TEMPLATE)];
    if (!this.currentProject) this.$state.go('about');
    this.worksheetToggleModel = [];
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
      this.loadingTemplates = true;
      this.projectConfig = this.currentProject.config;
      this.attributes = {};
      this.selected = {};
      this.getWorksheets();
      this.populateAttributesCache();
      this.description = this.currentProject.description;
      this.defAttribute = undefined;
      this.defWorksheet = undefined;
      this.makeArrayOfProjectsWithinCurrentTeam().then(data =>
        this.getAllTemplates(data),
      );
    }
  }

  async makeArrayOfProjectsWithinCurrentTeam() {
    return this.allProjects.data.filter(
      p =>
        p.projectConfiguration.id ===
        this.currentProject.projectConfiguration.id,
    );
  }

  getAllTemplates(projectsArray) {
    const APICalls = [];
    projectsArray.forEach(p =>
      APICalls.push(this.TemplateService.all(p.projectId)),
    );

    Promise.all(APICalls)
      .then(results => {
        this.allTemplates = results
          .filter(r => r.data.length > 0)
          .map(r => r.data)
          .flat();
      })
      .catch(angular.catcher('Failed to load templates'))
      .finally(() => {
        // AngularJS does not watch Promise.all, need to $apply manually
        // future updates: can replace Promise.all with $q?
        this.$scope.$apply(() => {
          this.loadingTemplates = false;
        });
        this.filterTemplates();
        this.templateChange();
      });
  }

  filterTemplates() {
    this.templates = this.allTemplates.filter(
      t => t.worksheet === this.worksheet,
    );
    this.templates.unshift(DEFAULT_TEMPLATE);
  }

  workbookSelectAll(value) {
    const worksheets = this.worksheets.filter(w => w !== 'Workbook');
    this.toggleModels(value);
    this.worksheetSelectAll(worksheets, value);
  }

  toggleModels(value) {
    this.attributeArray.forEach(a => {
      this.worksheetToggleModel[a.worksheet] = value;
    });
  }

  worksheetSelectAll(worksheets, value) {
    worksheets.forEach(w => {
      if (value === true) {
        this.selected[w] = Object.values(this.attributes[w].attributes).reduce(
          (result, group) => result.concat(group),
          [],
        );
      } else {
        this.selected[w] = this.attributes[w].attributes[
          'Minimum Information Standard Items'
        ].slice();
      }
    });
  }

  saveConfig(ev) {
    const columns = this.selected[this.worksheet].map(
      attribute => attribute.column,
    );

    if (!this.currentUser) {
      const login = this.$mdDialog
        .confirm()
        .title('You must be signed in to save a template')
        .ariaLabel('Login required')
        .targetEvent(ev)
        .ok('Sign In')
        .cancel('Cancel');

      this.$mdDialog
        .show(login)
        .then(() => {
          this.$state.go('login', {
            nextState: this.$state.current.name,
            nextStateParams: Object.assign({}, this.$state.params),
          });
        })
        .catch(() => {});
    } else {
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
        .catch(angular.catcher('Failed to save template'))
        .finally(() => {
          this.loading = false;
        });
    }
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
          this.template.project.projectId,
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
    this.workbookSelectAll(false);
    if (this.worksheet === 'Workbook') return;
    if (angular.equals(this.template, DEFAULT_TEMPLATE)) {
      this.setDefaultAttributeSelection();
    } else {
      this.selected[this.worksheet] = [];
      Object.values(this.attributes[this.worksheet].attributes)
        .reduce((result, attributes) => result.concat(attributes), [])
        .filter(a => this.template.columns.includes(a.column))
        .forEach(a => this.selected[this.worksheet].push(a));
    }
  }

  setDefaultAttributeSelection() {
    this.selected[this.worksheet] = this.attributes[this.worksheet].attributes[
      'Minimum Information Standard Items'
    ].concat(this.projectConfig.suggestedAttributes(this.worksheet));
  }

  canRemoveTemplate() {
    if (this.currentUser) {
      return (
        this.template &&
        !angular.equals(this.template, DEFAULT_TEMPLATE) &&
        this.template.user.userId === this.currentUser.userId
      );
    }
    return false;
  }

  generate() {
    const templates =
      this.worksheet === 'Workbook'
        ? Object.keys(this.selected).reduce((accumulator, worksheet) => {
            if (this.selected[worksheet].length > 0) {
              accumulator.push({
                worksheet,
                columns: this.selected[worksheet].map(
                  attribute => attribute.column,
                ),
              });
            }
            return accumulator;
          }, [])
        : [
            {
              worksheet: this.worksheet,
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

  populateAttributesCache() {
    this.attributes = this.projectConfig.entities.reduce(
      (accumulator, entity) => {
        const { worksheet } = entity;

        if (!worksheet) return accumulator;

        if (!this.selected[worksheet]) this.selected[worksheet] = [];

        // eslint-disable-next-line no-param-reassign
        accumulator[worksheet] = {
          attributes: Object.assign(
            {
              'Minimum Information Standard Items': this.projectConfig.requiredAttributes(
                worksheet,
              ),
            },
            this.projectConfig.attributesByGroup(worksheet, false),
          ),
        };

        // eslint-disable-next-line no-param-reassign
        this.selected[worksheet] = this.selected[worksheet].concat(
          accumulator[worksheet].attributes[
            'Minimum Information Standard Items'
          ],
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
                [group]: attributes.filter(a => !a.internal),
              }),
            {},
          );
        }

        return accumulator;
      },
      {},
    );
    this.makeAttributeArray();
  }

  makeAttributeArray() {
    this.attributeArray = [];
    Object.keys(this.attributes).forEach(k =>
      this.attributeArray.push({ worksheet: k, data: this.attributes[k] }),
    );
  }

  getWorksheets() {
    this.worksheets = this.projectConfig.worksheets();
    if (this.worksheets.length > 1 && !this.worksheets.includes('Workbook')) {
      this.worksheets.unshift('Workbook');
    }
    // eslint-disable-next-line prefer-destructuring
    this.worksheet = this.worksheets[0];
  }

  define(worksheet, attribute) {
    this.defAttribute = attribute;
    this.defWorksheet = worksheet;

    if (this.$mdMedia('xs')) {
      this.$mdDialog.show({
        template: definitionTemplate,
        locals: {
          currentProject: this.currentProject,
          attribute,
          worksheet,
          $mdDialog: this.$mdDialog,
        },
        controller: function Controller() {},
        bindToController: true,
        controllerAs: '$ctrl',
        clickOutsideToClose: true,
        disableParentScroll: false,
      });
    }
  }
}

export default {
  template,
  controller: TemplateController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
    allProjects: '<',
  },
};
