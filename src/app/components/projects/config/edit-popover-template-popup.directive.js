export default () => ({
  replace: true,
  scope: {
    uibTitle: '@',
    contentExp: '&',
    placement: '@',
    popupClass: '@',
    animation: '&',
    isOpen: '&',
    originScope: '&',
  },
  template: require('angular-ui-bootstrap/template/popover/popover-template.html'),
});
