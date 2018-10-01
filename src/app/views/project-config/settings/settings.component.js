import angular from 'angular';

const template = require('./config-settings.html');

export default {
  template,
  controller: function Controller() {
    this.$onChanges = changesObj => {
      if (this.config && 'config' in changesObj) {
        this.config = angular.copy(this.config);
      }
    };
  },
  bindings: {
    config: '<',
    onUpdate: '&',
    isNetworkAdmin: '<',
  },
};
