import angular from 'angular';

const openTemplate =
  `<label class='control-label col-xs-3 text-capitalize'>{{ $ctrl.key }}</label>
     <div class='col-xs-9'>`;

const closeTemplate = `</div>`;

const listTemplate =
  openTemplate +
  `<select
      required name='{{$ctrl.key}}' class='form-control'
      ng-options='list for list in $ctrl.lists'
      ng-model='$ctrl.rule[$ctrl.key]'>
  </select>` +
  closeTemplate;

const columnTemplate =
  openTemplate +
  `<select
      required name='{{$ctrl.key}}' class='form-control'
      ng-options='column for column in $ctrl.columns'
      ng-model='$ctrl.rule[$ctrl.key]'>
  </select>` +
  closeTemplate;

const columnsTemplate =
  openTemplate +
  `<ui-select required name='{{$ctrl.key}}' ng-model='$ctrl.rule[$ctrl.key]' multiple close-on-select='false'>
      <ui-select-match>{{ $item }}</ui-select-match>
      <ui-select-choices position='down' repeat='column in $ctrl.columns | filter: $select.search'>
          <div ng-bind-html='column | highlight: $select.search | trusted_html'></div>
      </ui-select-choices>
  </ui-select>` +
  closeTemplate;

const defaultTemplate =
  openTemplate +
  `<input
      required name='{{$ctrl.key}}' class='form-control'
      type='text'
      ng-model='$ctrl.rule[$ctrl.key]'/>` +
  closeTemplate;

const fimsRuleMetadataList = {
  template: listTemplate,
  bindings: {
    key: '<',
    lists: '<',
    rule: '<',
  },
};

const fimsRuleMetadataColumn = {
  template: columnTemplate,
  bindings: {
    key: '<',
    columns: '<',
    rule: '<',
  },
};

const fimsRuleMetadataColumns = {
  template: columnsTemplate,
  bindings: {
    key: '<',
    columns: '<',
    rule: '<',
  },
};

const fimsRuleMetadataDefault = {
  template: defaultTemplate,
  bindings: {
    key: '<',
    rule: '<',
  },
};

export default angular.module('fims.projectConfigRuleMetadata', [])
  .component('fimsRuleMetadataList', fimsRuleMetadataList)
  .component('fimsRuleMetadataColumn', fimsRuleMetadataColumn)
  .component('fimsRuleMetadataColumns', fimsRuleMetadataColumns)
  .component('fimsRuleMetadataDefault', fimsRuleMetadataDefault)
  .name;
