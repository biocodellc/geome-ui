import angular from 'angular';

const listTemplate = `
      <md-autocomplete md-selected-item="$ctrl.rule[$ctrl.key]" md-no-cache
        md-search-text="searchText" md-items="l in $ctrl.lists | filter: searchText"
        md-min-length="0" md-floating-label="{{$ctrl.key}}" required md-show-arrow="true"
        ng-click="searchText = ''">
        <md-item-template>
            <span md-highlight-text="searchText">{{l}}</span>
        </md-item-template>
      </md-autocomplete>`;

const columnTemplate = `
      <md-autocomplete md-selected-item="$ctrl.rule[$ctrl.key]" md-no-cache
        md-search-text="searchText" md-items="col in $ctrl.columns | filter: searchText"
        md-min-length="0" md-floating-label="{{$ctrl.key}}" required md-show-arrow="true"
        ng-click="searchText = ''">
        <md-item-template>
            <span md-highlight-text="searchText">{{col}}</span>
        </md-item-template>
      </md-autocomplete>`;

const columnsTemplate = `
    <md-chips ng-model="$ctrl.rule[$ctrl.key]" md-require-match>
      <md-autocomplete md-selected-item="selectedItem" md-no-cache md-autocomplete-snap="width"
        md-search-text="searchText" md-items="col in $ctrl.columns | exclude: $ctrl.rule[$ctrl.key] | filter: searchText"
        md-min-length="0" placeholder="Add {{$ctrl.key}}" required md-show-arrow="true"
        <md-item-template>
            <span md-highlight-text="searchText">{{col}}</span>
        </md-item-template>
      </md-autocomplete>
    </md-chips>`;

const stringTemplate = `
    <md-input-container class="md-block"><label class="text-capitalize">{{ $ctrl.key }}</label>
        <input required name='{{$ctrl.key}}' type='text' ng-model='$ctrl.rule[$ctrl.key]' />
    </md-input-container>`;

const checkboxTemplate = `
    <md-checkbox ng-model="$ctrl.rule[$ctrl.key]" class="md-align-top-left"
      name="{{$ctrl.key}}">{{$ctrl.key}}</md-checkbox>`;

const fimsMdRuleMetadataList = {
  template: listTemplate,
  bindings: {
    key: '<',
    lists: '<',
    rule: '<',
  },
};

const fimsMdRuleMetadataColumn = {
  template: columnTemplate,
  bindings: {
    key: '<',
    columns: '<',
    rule: '<',
  },
};

const fimsMdRuleMetadataColumns = {
  template: columnsTemplate,
  bindings: {
    key: '<',
    columns: '<',
    rule: '<',
  },
};

const fimsMdRuleMetadataCheckbox = {
  template: checkboxTemplate,
  bindings: {
    key: '<',
    rule: '<',
  },
};

const fimsMdRuleMetadataString = {
  template: stringTemplate,
  bindings: {
    key: '<',
    rule: '<',
  },
};

export default angular
  .module('fims.projectConfigMdRuleMetadata', [])
  .component('fimsMdRuleMetadataList', fimsMdRuleMetadataList)
  .component('fimsMdRuleMetadataColumn', fimsMdRuleMetadataColumn)
  .component('fimsMdRuleMetadataColumns', fimsMdRuleMetadataColumns)
  .component('fimsMdRuleMetadataCheckbox', fimsMdRuleMetadataCheckbox)
  .component('fimsMdRuleMetadataString', fimsMdRuleMetadataString).name;
