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

  //TODO check if this works
  $onChanges(changesObj) {
    if (changesObj.attribute !== this.attribute) {
      this._config = this.ProjectService.currentProject.config;
      // this.attribute = this.$scope.$parent.this.defAttribute;
      this.attribute = changesObj.attribute.currentValue;
      // this.rules = this._config.attributeRules(this.$scope.$parent.this.sheetName, this.attribute);
      this.rules = this._config.attributeRules(changesObj.sheetName.currentValue, this.attribute);
    }
  }

  // init() {
  //   this._config = this.ProjectService.currentProject.config;
  //   this.attribute = this.$scope.$parent.this.defAttribute;
  //   this.rules = this._config.attributeRules(this.$scope.$parent.this.sheetName, this.attribute);
  // }

  getListFields(listName) {
    const list = this._config.getList(listName);

    return (list) ? list.field : [];
  }

}

AttributeDefController.$inject = [ '$scope', 'ProjectService' ];

export default AttributeDefController;
