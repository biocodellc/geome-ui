import angular from 'angular';
import angularMaterial from 'angular-material';
import './mdSteppers.min.css';

const steppersTemplate = require('./mdStepper.tpl.html');
const stepTemplate = require('./mdStep.tpl.html');

// modified version of https://github.com/eberlitz/material-steppers

class StepperCtrl {
  constructor($mdComponentRegistry, $attrs, $log) {
    'ngInject';

    this.$mdComponentRegistry = $mdComponentRegistry;
    this.$attrs = $attrs;
    this.$log = $log;
    this.labelOf = 'of';
    this.labelStep = 'Step';
  }

  $onInit() {
    this.steps = [];
    this.currentStep = 0;
    this.visitedSteps = new Set();

    if (this.$attrs.mdMobileStepText === '') {
      this.mobileStepText = true;
    }
    if (this.$attrs.mdLinear === '') {
      this.linear = true;
    }
    if (this.$attrs.mdAlternative === '') {
      this.alternative = true;
    }
  }

  $onChanges(changesObj) {
    if ('linear' in changesObj || 'preventSkip' in changesObj) {
      // preventSkip can only be active if !linear
      this.preventSkip = !this.linear && this.preventSkip;
    }
  }

  $postLink() {
    if (!this.$attrs.id) {
      this.$log.warn('You must set an id attribute to your stepper');
    }
    this.registeredStepper = this.$mdComponentRegistry.register(
      this,
      this.$attrs.id,
    );
  }

  $onDestroy() {
    this.registeredStepper && this.registeredStepper();
  }

  /**
   * Register component step to this stepper.
   *
   * @param {StepCtrl} step The step to add.
   * @param number index The index to place the step in the stepper
   * @returns number - The step number.
   */
  $addStep(step, index) {
    if (index === undefined) {
      if (this.steps.length === 0) {
        this.visitedSteps.add(step);
      }
      return this.steps.push(step) - 1;
    }

    if (index === 0) {
      this.visitedSteps.add(step);
    }

    this.steps.splice(index, 0, step);
    this.updateStepNumbers();
    return index;
  }

  /**
   * Remove a component step from this stepper
   *
   * @param {StepCtrl} step The step to remove
   * @returns boolean - If the step was removed
   */
  $removeStep(step) {
    const i = this.steps.indexOf(step);
    if (i !== -1) {
      this.steps.splice(i, 1);
      this.updateStepNumbers();
      this.visitedSteps.delete(step);
      return true;
    }
    return false;
  }

  updateStepNumbers() {
    this.steps.forEach((stepCtrl, i) => {
      stepCtrl.stepNumber = i;
    });
  }

  /**
   * Complete the current step and move one to the next.
   * Using this method on editable steps (in linear stepper)
   * it will search by the next step without "completed" state to move.
   * When invoked it dispatch the event onstepcomplete to the step element.
   *
   * @returns boolean - True if move and false if not move (e.g. On the last step)
   */
  next() {
    if (this.currentStep < this.steps.length) {
      this.clearError();
      this.currentStep++;
      this.visitedSteps.add(this.steps[this.currentStep]);
      this.clearFeedback();
      return true;
    }
    return false;
  }

  /**
   * Move to the previous step without change the state of current step.
   * Using this method in linear stepper it will check if previous step is editable to move.
   *
   * @returns boolean - True if move and false if not move (e.g. On the first step)
   */
  back() {
    if (this.currentStep > 0) {
      this.clearError();
      this.currentStep--;
      this.clearFeedback();
      return true;
    }
    return false;
  }

  /**
   * Move to the next step without change the state of current step.
   * This method works only in optional steps.
   *
   * @returns boolean - True if move and false if not move (e.g. On non-optional step)
   */
  skip() {
    const step = this.steps[this.currentStep];
    if (step.optional) {
      this.currentStep++;
      this.clearFeedback();
      return true;
    }
    return false;
  }

  /**
   * Defines the current step state to "error" and shows the message parameter on
   * title message element.When invoked it dispatch the event onsteperror to the step element.
   *
   * @param {string} message The error message
   */
  error(message) {
    const step = this.steps[this.currentStep];
    step.hasError = true;
    step.message = message;
    this.clearFeedback();
  }

  /**
   * Defines the current step state to "normal" and removes the message parameter on
   * title message element.
   */
  clearError() {
    const step = this.steps[this.currentStep];
    step.hasError = false;
  }

  /**
   * Move "active" to specified step id parameter.
   * The id used as reference is the integer number shown on the label of each step (e.g. 2).
   *
   * @param {number} stepNumber (description)
   * @returns boolean - True if move and false if not move (e.g. On id not found)
   */
  goto(stepNumber) {
    if (stepNumber < this.steps.length) {
      if (this.preventSkip && !this.visitedSteps.has(this.steps[stepNumber])) {
        return false;
      }
      this.currentStep = stepNumber;
      this.clearFeedback();
      return true;
    }
    return false;
  }

  /**
   * Shows a feedback message and a loading indicador.
   *
   * @param {string} [message] The feedbackMessage
   */
  showFeedback(message) {
    this.hasFeedback = true;
    this.feedbackMessage = message;
  }

  /**
   * Removes the feedback.
   */
  clearFeedback() {
    this.hasFeedback = false;
  }

  visited(stepNum) {
    return this.visitedSteps.has(this.steps[stepNum]);
  }

  resetVisitedTo(stepNum) {
    if (stepNum === undefined) this.visitedSteps = new Set();
    else {
      this.visitedSteps = this.steps.reduce((accumulator, step, i) => {
        if (i <= stepNum) accumulator.add(step);
        return accumulator;
      }, new Set());
    }
  }

  isCompleted(stepNumber) {
    return this.linear && stepNumber < this.currentStep;
  }

  isActiveStep(step) {
    return this.steps.indexOf(step) === this.currentStep;
  }
}

const StepperServiceFactory = function factory($mdComponentRegistry) {
  'ngInject';

  return function get(handle) {
    const instance = $mdComponentRegistry.get(handle);

    if (!instance) {
      $mdComponentRegistry.notFoundError(handle);
    }

    return instance;
  };
};

class StepCtrl {
  constructor($element, $compile, $scope) {
    'ngInject';

    this.$element = $element;
    this.$compile = $compile;
    this.$scope = $scope;
  }

  $postLink() {
    const i = Number.isInteger(this.order) ? this.order : undefined;
    this.stepNumber = this.$stepper.$addStep(this, i);
  }

  $onDestroy() {
    this.$stepper.$removeStep(this);
  }

  isActive() {
    const state = this.$stepper.isActiveStep(this);
    return state;
  }

  hasVisited() {
    return this.$stepper.visited(this.stepNumber);
  }
}

export default angular
  .module('mdSteppers', [angularMaterial])
  .factory('$mdStepper', StepperServiceFactory)

  .directive('mdStepper', () => ({
    transclude: true,
    scope: {
      linear: '<?mdLinear',
      alternative: '<?mdAlternative',
      vertical: '<?mdVertical',
      mobileStepText: '<?mdMobileStepText',
      labelStep: '@?mdLabelStep',
      labelOf: '@?mdLabelOf',
      preventSkip: '<?mdPreventSkip',
    },
    bindToController: true,
    controller: StepperCtrl,
    controllerAs: 'stepper',
    template: steppersTemplate,
  }))
  .directive('mdStep', [
    '$compile',
    '$timeout',
    ($compile, $timeout) => ({
      require: '^^mdStepper',
      transclude: true,
      scope: {
        label: '@mdLabel',
        optional: '@?mdOptional',
        order: '<?mdOrder',
      },
      bindToController: true,
      controller: StepCtrl,
      controllerAs: '$mdStep',
      link: (scope, iElement, iAttrs, stepperCtrl) => {
        function addOverlay() {
          const hasOverlay = !!iElement.find('.md-step-body-overlay')[0];
          if (!hasOverlay) {
            const overlay = angular.element(`<div class="md-step-body-overlay"></div>
                            <div class="md-step-body-loading">
                                <md-progress-circular md-mode="indeterminate"></md-progress-circular>
                            </div>`);
            $compile(overlay)(scope);
            iElement.find('.md-steppers-scope').append(overlay);
          }
        }

        scope.$mdStep.$stepper = stepperCtrl;
        scope.$watch(
          () => scope.$mdStep.isActive(),
          isActive => {
            if (isActive) {
              iElement.addClass('md-active');
              addOverlay();
              // scroll after the step has rendered
              $timeout(() => {
                iElement[0].scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                  inline: 'nearest',
                });
              });
            } else {
              iElement.removeClass('md-active');
            }
          },
        );
      },
      template: stepTemplate,
    }),
  ])
  .directive('mdStep', () => ({
    require: 'mdStep', // require the above mdStep directive
    link: (scope, element, attrs, ctrl) => {
      // place the $mdStep on the parent scope
      // This should actually only place the $stepper on the parent scope.
      // The way we currently do this, $mdStep always evaluates to the last mdStep as that is the last ctrl to be set
      scope.$mdStep = ctrl;
    },
  }))

  .config(
    /* ngInject */ $mdIconProvider => {
      $mdIconProvider.icon('steppers-check', 'mdSteppers/ic_check_24px.svg');
      $mdIconProvider.icon(
        'steppers-warning',
        'mdSteppers/ic_warning_24px.svg',
      );
    },
  )
  .run(
    /* ngInject */ $templateCache => {
      $templateCache.put(
        'mdSteppers/ic_check_24px.svg',
        '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">\r\n    <path d="M0 0h24v24H0z" fill="none"/>\r\n    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>\r\n</svg>',
      );
      $templateCache.put(
        'mdSteppers/ic_warning_24px.svg',
        '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">\r\n    <path d="M0 0h24v24H0z" fill="none"/>\r\n    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>\r\n</svg>',
      );
    },
  ).name;
