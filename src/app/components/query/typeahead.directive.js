class TypeAheadController {
  constructor() {
    this.isVisible = false;
    this.expeditions = [];
    this.active = null;
    this.filterTerm = '';
    this.filteredExpeditions = [];
  }

  activate(expedition) {
    this.active = expedition;
  }

  activateNextItem() {
    const index = this.filteredExpeditions.indexOf(this.active);
    this.activate(
      this.filteredExpeditions[(index + 1) % this.filteredExpeditions.length],
    );
  }

  activatePreviousItem() {
    const index = this.filteredExpeditions.indexOf(this.active);
    this.activate(
      this.filteredExpeditions[
        index === 0 ? this.filteredExpeditions.length - 1 : index - 1
      ],
    );
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
    this.activate(this.filteredExpeditions[0]);
  }

  removeExpedition(expedition) {
    this.selectedExpeditions.splice(
      this.selectedExpeditions.indexOf(expedition),
      1,
    );
    this.filterExpeditions();
  }

  showExpedition() {
    return expedition =>
      !(
        this.selectedExpeditions.indexOf(expedition) !== -1 ||
        (this.filterTerm && !new RegExp(this.filterTerm, 'i').test(expedition))
      );
  }

  filterExpeditions() {
    const filteredExpeditions = [];

    this.expeditions.forEach(expedition => {
      if (
        this.selectedExpeditions.indexOf(expedition) === -1 &&
        (!this.filterTerm || new RegExp(this.filterTerm, 'i').test(expedition))
      ) {
        filteredExpeditions.push(expedition);
      }
    });

    this.filteredExpeditions = filteredExpeditions;
  }

  init() {
    this.filterExpeditions();
    this.activate(this.expeditions[0]);
  }
}

const typeaheadLink = (scope, element, attrs, controller) => {
  element.bind('keyup', e => {
    if (e.keyCode === 9 || e.keyCode === 13) {
      scope.$apply(() => {
        controller.selectActive();
      });
    }

    if (e.keyCode === 27) {
      scope.$apply(() => {
        scope.isVisible = false;
      });
    }
  });

  element.bind('keydown', e => {
    if (e.keyCode === 9 || e.keyCode === 13 || e.keyCode === 27) {
      e.preventDefault();
    }

    if (e.keyCode === 40) {
      e.preventDefault();
      scope.$apply(() => {
        controller.activateNextItem();
      });
    }

    if (e.keyCode === 38) {
      e.preventDefault();
      scope.$apply(() => {
        controller.activatePreviousItem();
      });
    }
  });

  scope.$watch('expeditions', expeditions => {
    expeditions.length ? controller.init() : null;
  });
};

const typeaheadItemLink = (scope, element, attrs, controller) => {
  const item = scope.$eval(attrs.typeaheadItem);

  scope.$watch(
    () => controller.isActive(item),
    active => {
      if (active) {
        element.addClass('active');
      } else {
        element.removeClass('active');
      }
    },
  );

  element.bind('mouseenter', evt => {
    scope.$apply(() => {
      controller.activate(item);
    });
  });

  element.bind('click', e => {
    scope.$apply(() => {
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
  controller: TypeAheadController,
  controllerAs: 'typeahead',
  template: require('./typeahead.html'),
  link: typeaheadLink,
});

const typeaheadItem = () => ({
  require: '^typeahead',
  link: typeaheadItemLink,
});

export default angular
  .module('fims.expeditionTypeahead', [])
  .directive('typeahead', typeahead)
  .directive('typeaheadItem', typeaheadItem).name;
