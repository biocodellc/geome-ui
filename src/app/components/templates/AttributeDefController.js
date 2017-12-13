class AttributeDefController {
  constructor($scope, ProjectService) {
    this._config = undefined;

    this.attribute = undefined;
    this.rules = [];

    this.$scope = $scope;
    this.ProjectService = ProjectService;

    // $scope.$watch('$parent.vm.defAttribute', (newVal, oldVal) => {
    //   if (newVal !== oldVal) {
    //     this.init();
    //   }
    // });
  }

  $onInit() {
    this._config = this.ProjectService.currentProject.config;
  }

  $onChanges({ attribute, sheetName }) {
    //TODO check if this works when changing sheet
    if (this.attribute) { //&& attribute.currentValue !== attribute.previousValue) {
      this.rules = this._config.attributeRules(this.sheetName, this.attribute);
    }
  }

  getListFields(listName) {
    const list = this._config.getList(listName);

    return (list) ? list.field : [];
  }

}

AttributeDefController.$inject = [ '$scope', 'ProjectService' ];

export default AttributeDefController;
