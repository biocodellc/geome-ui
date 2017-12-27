function getStates() {
  return [
    {
      state: 'project',
      config: {
        url: '/project',
        component: 'fimsProject',
        redirectTo: "project.settings",
        resolve: {
          currentProject: /*ngInject*/(Projects) => Projects.currentProject()
        },
        projectRequired: true,
        loginRequired: true,
      },
    },
  ];
}

configExit.$inject = [ '$transition$', 'config' ];

function configExit(trans, config) {
  // var config = trans.injector().get('config');
  if (config.modified) {
    var $uibModal = trans.injector().get('$uibModal');

    var modal = $uibModal.open({
      template: require('./config/templates/unsaved-config-confirmation.html'),
      size: 'md',
      controller: configConfirmationController,
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: 'static',
    });

    return modal.result;
  }
}

configConfirmationController.$inject = [ '$uibModalInstance' ];

function configConfirmationController($uibModalInstance) {
  var vm = this;
  vm.continue = $uibModalInstance.close;
  vm.cancel = $uibModalInstance.dismiss;
}


export default ($transitions, routerHelper, UserService, Projects) => {
  'ngInject';
  routerHelper.configureStates(getStates());

  // We reload the state if the currentProject has changed.
  // check that the currentUser is the admin of the project
  // if not, redirect
  $transitions.onBefore({ to: 'project.**' }, (trans) =>
    Promise.all([ UserService.waitForUser(), Projects.waitForProject() ])
      .then(([ user, project ]) => {
        if (user.userId !== project.user.userId) {
          return trans.router.stateService.target('home');
        }
      })
      .catch(() => trans.router.stateService.target('home'))
  );
  // $transitions.onExit({ exiting: 'project.config' }, _configExit);
};
