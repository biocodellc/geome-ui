import ProjectMembersController from "./members/project-members.controller";
import ProjectMembersAddController from "./members/project-members-add.controller";
import ConfigController from "./config/config.controller";
import ConfigMetadataController from "./config/config-metadata.controller";
import EntitiesController from "./config/entities.controller";
import EntityController from "./config/entity.controller";
import AddEntityController from "./config/entity-add.controller";
import EntityAttributesController from "./config/entity-attributes.controller";
import EntityRulesController from "./config/entity-rules.controller";
import ListsController from "./config/lists.controller";
import ListController from "./config/list.controller";
import AddListController from "./config/list-add.controller";
import AddRuleController from "./config/rule-add.controller";


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
            template: require('./config/templates/config.html'),
            controller: ConfigController,
            controllerAs: 'vm',
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
            template: require('./config/templates/config-metadata.html'),
            controller: ConfigMetadataController,
            controllerAs: 'vm',
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
            template: require('./config/templates/entities.html'),
            controller: EntitiesController,
            controllerAs: 'vm',
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
            template: require('./config/templates/add-entity.html'),
            controller: AddEntityController,
            controllerAs: 'vm',
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
            template: require('./config/templates/entity-detail.html'),
            controller: EntityController,
            controllerAs: 'vm',
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
            template: require('./config/templates/entity-attributes.html'),
            controller: EntityAttributesController,
            controllerAs: 'vm',
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
            template: require('./config/templates/entity-rules.html'),
            controller: EntityRulesController,
            controllerAs: 'vm',
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
            template: require('./config/templates/add-rule.html'),
            controller: AddRuleController,
            controllerAs: 'vm',
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
            template: require('./config/templates/lists.html'),
            controller: ListsController,
            controllerAs: 'vm',
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
            template: require('./config/templates/list-detail.html'),
            controller: ListController,
            controllerAs: 'vm',
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
            template: require('./config/templates/add-list.html'),
            controller: AddListController,
            controller: ListController,
          },
        },
      },
    },
    //- End Config
  ];
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
