class TypeAheadController {
  constructor() {
    this.isVisible = false;
    this.expeditions = [];
    this.active = null;
    this.filterTerm = "";
    this.filteredExpeditions = [];
  }

  activate(expedition) {
    this.active = expedition;
  }

  activateNextItem() {
    var index = this.filteredExpeditions.indexOf(this.active);
    this.activate(this.filteredExpeditions[ (index + 1) % this.filteredExpeditions.length ]);
  }

  activatePreviousItem() {
    var index = this.filteredExpeditions.indexOf(this.active);
    this.activate(this.filteredExpeditions[
      index === 0
        ? this.filteredExpeditions.length - 1
        : index - 1
      ]);
  }

  isActive(expedition) {
    return this.active === expedition;
  }

  selectActive() {
    this.select(this.active);
  }

  select(expedition) {
    this.selectedExpeditions.push(expedition);
    this.active = null;
    this.filterExpeditions();
    this.activate(this.filteredExpeditions[ 0 ]);
  }

  removeExpedition(expedition) {
    this.selectedExpeditions.splice(this.selectedExpeditions.indexOf(expedition), 1);
    this.filterExpeditions();
  }

  showExpedition() {
    return (expedition) => {
      return !(this.selectedExpeditions.indexOf(expedition) !== -1 || (this.filterTerm && !new RegExp(this.filterTerm, 'i').test(expedition)));
    };
  }

  filterExpeditions() {
    var filteredExpeditions = [];

    this.expeditions.forEach(expedition => {
      if (this.selectedExpeditions.indexOf(expedition) === -1 && (!this.filterTerm || new RegExp(this.filterTerm, 'i').test(expedition))) {
        filteredExpeditions.push(expedition);
      }
    });

    this.filteredExpeditions = filteredExpeditions;
  }

  init() {
    this.filterExpeditions();
    this.activate(this.expeditions[ 0 ]);
  }

}


const typeaheadLink = (scope, element, attrs, controller) => {

  element.bind('keyup', function (e) {
    if (e.keyCode === 9 || e.keyCode === 13) {
      scope.$apply(function () {
        controller.selectActive();
      });
    }

    if (e.keyCode === 27) {
      scope.$apply(function () {
        scope.isVisible = false;
      });
    }
  });

  element.bind('keydown', function (e) {
    if (e.keyCode === 9 || e.keyCode === 13 || e.keyCode === 27) {
      e.preventDefault();
    }

    if (e.keyCode === 40) {
      e.preventDefault();
      scope.$apply(function () {
        controller.activateNextItem();
      });
    }

    if (e.keyCode === 38) {
      e.preventDefault();
      scope.$apply(function () {
        controller.activatePreviousItem();
      });
    }
  });

  scope.$watch('expeditions', function (expeditions) {
    expeditions.length
      ? controller.init()
      : null;
  });

};


const typeaheadItemLink = (scope, element, attrs, controller) => {
  const item = scope.$eval(attrs.typeaheadItem);

  scope.$watch(function () {
    return controller.isActive(item);
  }, function (active) {
    if (active) {
      element.addClass('active');
    } else {
      element.removeClass('active');
    }
  });

  element.bind('mouseenter', function (evt) {
    scope.$apply(function () {
      controller.activate(item);

    });
  });

  element.bind('click', function (e) {
    scope.$apply(function () {
      controller.select(item);
    });
  });
};

const typeahead = () => ({
  restrict: 'E',
  scope: {
    expeditions: '=',
    selectedExpeditions: '=',
  },
  controller: "TypeAheadController",
  controllerAs: "typeahead",
  templateUrl: require('./typeahead.html'),
  link: typeaheadLink,
});

const typeaheadItem = () => ({
  require: '^typeahead',
  link: typeaheadItemLink,
});

const module = angular.module('fims.expeditionTypeahead', []);
module.controller('TypeAheadController', TypeAheadController);

export default {
  typeahead: module.directive('typeahead', typeahead).name,
  typeaheadItem: module.directive('typeaheadItem', typeaheadItem).name,
}
