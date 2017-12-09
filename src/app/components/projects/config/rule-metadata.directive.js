(function () {
    'use strict';

    angular.module('fims.projects')
        .directive('ruleMetadata', ruleMetadata)
        .run(_populateCache);

    ruleMetadata.$inject = ['$templateCache', '$compile'];

    function ruleMetadata($templateCache, $compile) {
        return {
            restrict: 'EA',
            scope: {
                key: '<',
                rule: '=',
                columns: '<',
                lists: '<'
            },
            link: function (scope, element, attrs, ctrl) {
                var template;

                if (scope.key === 'listName') {
                    template = $compile($templateCache.get('fims.config.rule.metadata-list.tpl.html'))(scope);
                } else if (scope.key.toLowerCase().indexOf('column') > -1 && !angular.isArray(scope.rule[scope.key])) {
                    template = $compile($templateCache.get('fims.config.rule.metadata-column.tpl.html'))(scope);
                } else if (scope.key.toLowerCase().indexOf('column') > -1 && angular.isArray(scope.rule[scope.key])) {
                    template = $compile($templateCache.get('fims.config.rule.metadata-columns.tpl.html'))(scope);
                } else {
                    template = $compile($templateCache.get('fims.config.rule.metadata-default.tpl.html'))(scope);
                }

                element.append(template);
            }
        }
    }

    _populateCache.$inject = ['$templateCache'];

    function _populateCache($templateCache) {
        var openTemplate = "<label class='control-label col-xs-3 text-capitalize'>{{ key }}</label>\n" +
            "<div class='col-xs-9'>";
        var closeTemplate = "</div>\n";

        $templateCache.put('fims.config.rule.metadata-list.tpl.html',
            openTemplate +
            "<select\n" +
            "    required name='{{key}}' class='form-control'\n" +
            "    ng-options='list for list in lists'\n" +
            "    ng-model='rule[key]'></select>\n" +
            closeTemplate
        );

        $templateCache.put('fims.config.rule.metadata-column.tpl.html',
            openTemplate +
            "<select\n" +
            "    required name='{{key}}' class='form-control'\n" +
            "    ng-options='column for column in columns'\n" +
            "    ng-model='rule[key]'></select>\n" +
            closeTemplate
        );

        $templateCache.put('fims.config.rule.metadata-columns.tpl.html',
            openTemplate +
            "<ui-select required name='{{key}}' ng-model='rule[key]' multiple close-on-select='false'>\n" +
            "    <ui-select-match>{{ $item}}</ui-select-match>\n" +
            "    <ui-select-choices position='down' repeat='column in columns | filter: $select.search'>\n" +
            "        <div ng-bind-html='column | highlight: $select.search | trusted_html'></div>\n" +
            "    </ui-select-choices>\n" +
            "</ui-select>\n" +
            closeTemplate
        );

        $templateCache.put('fims.config.rule.metadata-default.tpl.html',
            openTemplate +
            "<input\n" +
            "    required name='{{key}}' class='form-control'\n" +
            "    type='text'\n" +
            "    ng-model='rule[key]'/>\n" +
            closeTemplate
        );
    }
})();
