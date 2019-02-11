import angular from 'angular';

const STORAGE_KEY = 'biscicol';

class StorageService {
  constructor($window) {
    this.storage = {};

    this.window = $window;
    if (angular.isDefined(this.window.localStorage[STORAGE_KEY])) {
      this.storage = JSON.parse(this.window.localStorage[STORAGE_KEY]);
    }
  }

  get(key) {
    return this.storage[key];
  }

  set(key, val) {
    this.storage[key] = val;

    this.window.localStorage[STORAGE_KEY] = JSON.stringify(this.storage);
  }

  extend(obj) {
    angular.extend(this.storage, obj);

    this.window.localStorage[STORAGE_KEY] = JSON.stringify(this.storage);
  }
}

export default angular
  .module('fims.storageService', [])
  .service('StorageService', StorageService).name;
