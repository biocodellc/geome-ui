(function() {
    'use strict';

    angular.module('fims.query')
        .filter('queryTypeDisplay', queryTypeDisplay);

    function queryTypeDisplay() {
        var types = {
            'EQUALS': '=',
            'EXISTS': 'has',
            'FUZZY': 'fuzzy',
            'LESS_THEN': '<',
            'LESS_THEN_EQUALS': '<=',
            'GREATER_THEN': '>',
            'GREATER_THEN_EQUALS': '>='
        };

        function display(type) {
            return types[type];
        }

        return display;
    }

})();