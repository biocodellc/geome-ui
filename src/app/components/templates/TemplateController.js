const DEFAULT_TEMPLATE = { name: 'DEFAULT' };

class TemplateController {
  constructor($scope, UserService, TemplateService, ProjectService, exception) {
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

    this.$scope = $scope;
    this.UserService = UserService;
    this.TemplateService = TemplateService;
    this.ProjectService = ProjectService;
    this.exception = exception;

    this.init();

    $scope.$on('$projectChangeEvent', () => this.init());
  }

  init() {
    const project = this.ProjectService.currentProject;
    if (project) {
      this._config = project.config;
      this._getTemplates();
      this._getWorksheets();
      this._getAttributes();
      this.description = project.description;
    }

    this.$scope.$watch(
      () => this.UserService.currentUser,
      (newVal) => {
        this.isAuthenticated = !!(newVal);
      },
    )
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
      this.template.user.userId === this.UserService.currentUser.userId;
  }

  generate() {
    const columns = this.selected.map(attribute => attribute.column);

    this.TemplateService.generate(this.ProjectService.currentProject.projectId, this.sheetName, columns);
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
    this.TemplateService.all(this.ProjectService.currentProject.projectId)
      .then((response) => {
          this._templates = response.data;
          this._filterTemplates();
          this.templateChange();
        },
        this.exception.catcher("Failed to load templates"),
      );
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

TemplateController.$inject = [ '$rootScope', 'UserService', 'TemplateService', 'ProjectService', 'exception' ];

export default TemplateController;

