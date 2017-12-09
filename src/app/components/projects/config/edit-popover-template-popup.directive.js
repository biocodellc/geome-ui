(function () {
    'use strict';

    angular.module('fims.projects')
        .directive('editPopoverTemplatePopup', function () {
            return {
                replace: true,
                scope: {
                    uibTitle: '@', contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&',
                    originScope: '&'
                },
                templateUrl: 'uib/template/popover/popover-template.html'
            };
        });
})();
