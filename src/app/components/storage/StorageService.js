import angular from 'angular';

const STORAGE_KEY = 'biscicol';

class StorageService {
  constructor($window) {
    this.storage = {};

    this.window = $window;
    if (angular.isDefined(this.window.sessionStorage[ STORAGE_KEY ])) {
      this.storage = JSON.parse(this.window.sessionStorage[ STORAGE_KEY ]);
    }
  }

  get(key) {
    return this.storage[ key ];
  }

  set(key, val) {
    this.storage[ key ] = val;

    this.window.sessionStorage[ STORAGE_KEY ] = JSON.stringify(this.storage);
  }

  extend(obj) {
    angular.extend(this.storage, obj);

    this.window.sessionStorage[ STORAGE_KEY ] = JSON.stringify(this.storage);
  }

}

StorageService.$inject = [ '$window' ];

export default StorageService;

