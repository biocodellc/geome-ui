const POPOVER_TEMPLATE = `
<div>
    <table class="table table-condensed">
        <thead>
        <tr>
            <th>Marker</th>
            <th>Description</th>
        </tr>
        </thead>
        <tbody>
        <tr ng-repeat="field in $ctrl.markers track by field.value">
            <td>{{ ::field.value }}</td>
            <td>{{ ::field.definition}}</td>
        </tr>
        </tbody>
    </table>
</div>
`;

class FastaDataController {
  constructor($templateCache) {
    'ngInject';

    $templateCache.put('fastaData.popover.html', POPOVER_TEMPLATE);
  }

  $onInit() {
    this.data = this.data ? this.data.slice() : [];
    if (this.data.length === 0) {
      this.addData();
    }
  }

  $onChanges(changesObj) {
    if ('data' in changesObj) {
      this.data = changesObj.data.currentValue.slice();
    }

    if ('config' in changesObj && changesObj.config.currentValue) {
      this.fastqMetadataLists = this.config.getList('fastqMetadata');
    }
  }

  removeData() {
    this.data.pop();
    this.dataChanged();
  }

  addData() {
    this.data.push({
      file: undefined,
      metadata: { marker: undefined },
    });
  }

  dataChanged() {
    this.onChange({ data: this.data });
  }
}

export default {
  template: require('./fastaData.html'),
  controller: FastaDataController,
  bindings: {
    data: '<',
    form: '<',
    config: '<',
    onChange: '&',
  },
};
