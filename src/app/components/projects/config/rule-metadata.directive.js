const openTemplate = "<label class='control-label col-xs-3 text-capitalize'>{{ key }}</label>\n" +
  "<div class='col-xs-9'>";
const closeTemplate = "</div>\n";

const listTemplate =
  openTemplate +
  "<select\n" +
  "    required name='{{key}}' class='form-control'\n" +
  "    ng-options='list for list in lists'\n" +
  "    ng-model='rule[key]'></select>\n" +
  closeTemplate;

const columnTemplate =
  openTemplate +
  "<select\n" +
  "    required name='{{key}}' class='form-control'\n" +
  "    ng-options='column for column in columns'\n" +
  "    ng-model='rule[key]'></select>\n" +
  closeTemplate;

const columnsTemplate =
  openTemplate +
  "<ui-select required name='{{key}}' ng-model='rule[key]' multiple close-on-select='false'>\n" +
  "    <ui-select-match>{{ $item}}</ui-select-match>\n" +
  "    <ui-select-choices position='down' repeat='column in columns | filter: $select.search'>\n" +
  "        <div ng-bind-html='column | highlight: $select.search | trusted_html'></div>\n" +
  "    </ui-select-choices>\n" +
  "</ui-select>\n" +
  closeTemplate;

const defaultTemplate =
  openTemplate +
  "<input\n" +
  "    required name='{{key}}' class='form-control'\n" +
  "    type='text'\n" +
  "    ng-model='rule[key]'/>\n" +
  closeTemplate;

/*ngInject*/
export default ruleMetadata => ($compile) => ({
  restrict: 'EA',
  scope: {
    key: '<',
    rule: '=',
    columns: '<',
    lists: '<',
  },
  link: function (scope, element, attrs, ctrl) {
    let template;

    if (scope.key === 'listName') {
      template = $compile(listTemplate)(scope);
    } else if (scope.key.toLowerCase().indexOf('column') > -1 && !Array.isArray(scope.rule[ scope.key ])) {
      template = $compile(columnTemplate)(scope);
    } else if (scope.key.toLowerCase().indexOf('column') > -1 && Array.isArray(scope.rule[ scope.key ])) {
      template = $compile(columnsTemplate)(scope);
    } else {
      template = $compile(defaultTemplate)(scope);
    }

    element.append(template);
  },
});
