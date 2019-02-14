const template = require('./forbidden.html');

export default {
  template,
  controller: /* @ngInject */ $state => ({
    signIn: () => {
      $state.go('login', $state.params);
    },
  }),
};
