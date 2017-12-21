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


expeditionDetailOnEnter.$inject = [ '$rootScope', '$state' ];

function expeditionDetailOnEnter($rootScope, $state) {
  $rootScope.$on('$projectChangeEvent', function () {
    $state.go('project.expeditions', {}, { reload: true, inherit: false });
  });
}

resolveConfig.$inject = [ 'currentProject' ];

function resolveConfig(project) {
  return angular.copy(project.config);
}

entitiesDetailOnEnter.$inject = [ '$rootScope', '$state' ];

function entitiesDetailOnEnter($rootScope, $state) {
  $rootScope.$on('$projectChangeEvent', function () {
    $state.go('project.config.entities', {}, { reload: true, inherit: false });
  });
}

resolveEntity.$inject = [ '$transition$', '$state', 'config' ];

function resolveEntity($transition$, $state, config) {
  var entity = $transition$.params().entity;

  if (entity) {
    return entity;
  } else {
    var entities = config.entities;
    for (var i = 0; i < entities.length; i++) {
      if (entities[ i ].conceptAlias === $transition$.params().alias) {
        return entities[ i ];
      }
    }

    return $state.go('project.config.entities');
  }
}

listsDetailOnEnter.$inject = [ '$rootScope', '$state' ];

function listsDetailOnEnter($rootScope, $state) {
  $rootScope.$on('$projectChangeEvent', function () {
    $state.go('project.config.lists', {}, { reload: true, inherit: false });
  });
}

resolveList.$inject = [ '$transition$', '$state', 'config' ];

function resolveList($transition$, $state, config) {
  var list = $transition$.params().list;

  if (list) {
    return list;
  } else {
    var lists = config.lists;
    for (var i = 0; i < lists.length; i++) {
      if (lists[ i ].alias === $transition$.params().alias) {
        return lists[ i ];
      }
    }

    return $state.go('project.config.lists');
  }
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


const routing = (routerHelper) => {
  routerHelper.configureStates(getStates());

  // $transitions.onExit({ exiting: 'project.config' }, _configExit);
};


export default routing;
