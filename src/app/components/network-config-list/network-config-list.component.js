const template = require('./network-config-list.html');

class NetworkConfigListController {
  $onInit() {
    this.orderBy = 'value';
  }
}

export default {
  template,
  controller: NetworkConfigListController,
  bindings: {
    list: '<',
  },
};
