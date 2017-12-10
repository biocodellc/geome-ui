import ProjectMembersController from "./members/project-members.controller";
import ProjectMembersAddController from "./members/project-members-add.controller";

function getStates() {
  return [
    {
      state: 'project',
      config: {
        url: '/project',
        template: require('./project.html'),
        controller: "ProjectController as vm",
        redirectTo: "project.settings",
        onEnter: projectOnEnter,
        resolve: {
          project: resolveProject,
        },
        projectRequired: true,
        loginRequired: true,
        waitForResolves: true,
      },
    },
    {
      state: 'project.settings',
      config: {
        url: '/settings',
        views: {
          "details": {
            template: require('./project-settings.html'),
            controller: "ProjectSettingsController as vm",
          },
        },
      },
    },

    // Expeditions
    {
      state: 'project.expeditions',
      config: {
        url: '/expeditions',
        resolve: {
          expeditions: resolveExpeditions,
        },
        views: {
          "details": {
            template: require('./project-expeditions.html'),
            controller: "ProjectExpeditionsController as vm",
          },
        },
        waitForResolves: true,
      },
    },
    {
      state: 'project.expeditions.detail',
      config: {
        url: '/:id',
        onEnter: expeditionDetailOnEnter,
        redirectTo: "project.expeditions.detail.settings",
        resolve: {
          expedition: resolveExpedition,
          backState: () => "project.expeditions",
        },
        views: {
          "@": {
            template: '<div class="admin" ng-include="\'app/components/expeditions/expedition-detail.html\'"></div>',
            controller: "ExpeditionController as vm",
          },
        },
        params: {
          id: {
            type: "int",
          },
          expedition: {},
        },
      },
    },
    {
      state: 'project.expeditions.detail.settings',
      config: {
        url: '/settings',
        views: {
          "details": {
            template: require('../expeditions/expedition-detail-settings.html'),
            controller: "ExpeditionSettingsController as vm",
          },
        },
      },
    },
    {
      state: 'project.expeditions.detail.resources',
      config: {
        url: '/resources',
        views: {
          "details": {
            template: require('../expeditions/expedition-detail-resources.html'),
            controller: "ExpeditionResourcesController as vm",
          },
        },
      },
    },
    {
      state: 'project.expeditions.detail.members',
      config: {
        url: '/members',
        views: {
          "details": {
            template: require('../expeditions/expedition-detail-members.html'),
            // controller: "ExpeditionMembersController as vm"
          },
        },
      },
    },
    //- End Expeditions

    // Members

    {
      state: 'project.members',
      config: {
        url: '/members',
        resolve: {
          members: resolveMembers,
        },
        views: {
          "details": {
            template: require('./members/project-members.html'),
            controller: ProjectMembersController,
            controllerAs: 'vm',
          },
        },
        waitForResolves: true,
      },
    },
    {
      state: 'project.members.add',
      config: {
        url: '/add',
        template: require('./members/project-members-add.html'),
        controller: ProjectMembersAddController,
        controllerAs: 'vm',
      },
    },

    //- End Members

    // Config
    {
      state: 'project.config',
      config: {
        url: '/config',
        redirectTo: 'project.config.entities',
        onExit: configExit,
        resolve: {
          config: resolveConfig,
        },
        views: {
          "details": {
            template: require('./config/templates/config.tpl.html'),
            controller: "ConfigController as vm",
          },
        },
      },
    },
    {
      state: 'project.config.metadata',
      config: {
        url: '/metadata',
        views: {
          "objects": {
            template: require('./config/templates/config-metadata.tpl.html'),
            controller: "ConfigMetadataController as vm",
          },
        },
      },
    },

    // Entities
    {
      state: 'project.config.entities',
      config: {
        url: '/entities',
        views: {
          "objects": {
            template: require('./config/templates/entities.tpl.html'),
            controller: "EntitiesController as vm",
          },
        },
      },
    },
    {
      state: 'project.config.entities.add',
      config: {
        url: '/add',
        views: {
          "objects@project.config": {
            template: require('./config/templates/add-entity.tpl.html'),
            controller: "AddEntityController as vm",
          },
        },
      },
    },

    {
      state: 'project.config.entities.detail',
      config: {
        url: '/:alias/',
        onEnter: entitiesDetailOnEnter,
        redirectTo: "project.config.entities.detail.attributes",
        resolve: {
          entity: resolveEntity,
        },
        views: {
          "@project.config": {
            template: require('./config/templates/entity-detail.tpl.html'),
            controller: "EntityController as vm",
          },
        },
        params: {
          alias: {
            type: "string",
          },
        },
      },
    },

    {
      state: 'project.config.entities.detail.attributes',
      config: {
        url: 'attributes',
        views: {
          "objects": {
            template: require('./config/templates/entity-attributes.tpl.html'),
            controller: "EntityAttributesController as vm",
          },
        },
        params: {
          addAttribute: {
            type: "bool",
          },
        },
      },
    },

    {
      state: 'project.config.entities.detail.rules',
      config: {
        url: 'rules',
        views: {
          "objects": {
            template: require('./config/templates/entity-rules.tpl.html'),
            controller: "EntityRulesController as vm",
          },
        },
      },
    },
    {
      state: 'project.config.entities.detail.rules.add',
      config: {
        url: '/add',
        views: {
          "objects@project.config.entities.detail": {
            template: require('./config/templates/add-rule.tpl.html'),
            controller: "AddRuleController as vm",
          },
        },
      },
    },
    //- End Entities

    {
      state: 'project.config.lists',
      config: {
        url: '/lists',
        views: {
          "objects": {
            template: require('./config/templates/lists.tpl.html'),
            controller: "ListsController as vm",
          },
        },
      },
    },
    {
      state: 'project.config.lists.detail',
      config: {
        url: '/:alias/',
        onEnter: listsDetailOnEnter,
        resolve: {
          list: resolveList,
        },
        views: {
          "@project.config": {
            template: require('./config/templates/list-detail.tpl.html'),
            controller: "ListController as vm",
          },
        },
        params: {
          alias: {
            type: "string",
          },
          addField: {
            type: "bool",
          },
        },
      },
    },
    {
      state: 'project.config.lists.add',
      config: {
        url: '/add',
        views: {
          "objects@project.config": {
            template: require('./config/templates/add-list.tpl.html'),
            controller: "AddListController as vm",
          },
        },
      },
    },
    //- End Config
  ];
}

resolveProject.$inject = [ '$state', 'ProjectService' ];

function resolveProject($state, ProjectService) {
  return ProjectService.waitForProject()
    .then(function (project) {
      return project;
    }, function () {
      return $state.go('home');
    });

}

projectOnEnter.$inject = [ '$rootScope', '$state' ];

function projectOnEnter($rootScope, $state) {
  $rootScope.$on('$projectChangeEvent', function () {
    $state.reload();
  });
}

resolveExpeditions.$inject = [ '$state', 'ExpeditionService' ];

function resolveExpeditions($state, ExpeditionService) {

  return ExpeditionService.all()
    .then(function (response) {
      return response.data;
    }, function () {
      return $state.go('project');
    });
}

resolveExpedition.$inject = [ '$transition$', '$state', 'ExpeditionService' ];

function resolveExpedition($transition$, $state, ExpeditionService) {
  var expedition = $transition$.params().expedition;

  if (expedition) {
    return expedition;
  } else {
    return ExpeditionService.all()
      .then(function (response) {
        var expeditions = response.data;

        for (var i = 0; i < expeditions.length; i++) {
          if (expeditions[ i ].expeditionId === $transition$.params().id) {
            return expeditions[ i ];
          }
        }

        $state.go('project.expeditions');
      });
  }
}

resolveMembers.$inject = [ '$state', 'ProjectMembersService' ];

function resolveMembers($state, ProjectMembersService) {

  return ProjectMembersService.all()
    .then(function (response) {
      return response.data;
    }, function () {
      return $state.go('project');
    });
}

expeditionDetailOnEnter.$inject = [ '$rootScope', '$state' ];

function expeditionDetailOnEnter($rootScope, $state) {
  $rootScope.$on('$projectChangeEvent', function () {
    $state.go('project.expeditions', {}, { reload: true, inherit: false });
  });
}

resolveConfig.$inject = [ 'project' ];

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

function _checkProjectRequired(state) {
  var s = state;

  do {
    if (s.projectRequired) {
      return true;
    }
    s = s.parent;
  } while (s);

  return false;
}


configExit.$inject = [ '$transition$', 'config' ];

function configExit(trans, config) {
  // var config = trans.injector().get('config');
  if (config.modified) {
    var $uibModal = trans.injector().get('$uibModal');

    var modal = $uibModal.open({
      template: require('./config/templates/unsaved-config-confirmation.tpl.html'),
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


const routing = ($transitions, routerHelper, ProjectService) => {
  'ngInject';

  routerHelper.configureStates(getStates());

  $transitions.onBefore({}, function (trans) {
    const to = trans.$to();
    if (_checkProjectRequired(to)) {
      return ProjectService.waitForProject()
        .then(function () {
        }, function () {
          return trans.router.stateService.target('home');
        });
    }
  });

  // $transitions.onExit({ exiting: 'project.config' }, _configExit);
};


export default routing;
