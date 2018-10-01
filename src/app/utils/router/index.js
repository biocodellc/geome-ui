import angular from 'angular';

import routerHelperProvider from './routerHelperProvider';

// a transition is only valid if it is the current transition
export const isTransitionValid = (transition, TransitionService) =>
  TransitionService._transitionCount - 1 === transition.$id;

// helper function for transition hooks
// necessary to use this in an onBefore hook b/c the transition can be superseeded before this hook is ever run
// if that happens, we must fail this transition as the router will break if we don't
export const executeIfTransitionValid = (transition, TransitionService, fn) => {
  if (isTransitionValid(transition, TransitionService)) return fn();

  return false;
};

export default angular
  .module('fims.router', [])
  .provider('routerHelper', routerHelperProvider).name;
