import ExpeditionsController from "./expeditions.controller";
import ExpeditionSettingsController from "./expedition-settings.controller";
import ExpeditionController from "./expedition.controller";
import ExpeditionResourcesController from "./expedition-resources.controller";

function getStates() {
  return [
    {
      state: 'expeditions',
      config: {
        abstract: true,
        template: '<div ui-view class="admin"></div>',
        resolve: {
          expeditions: resolveExpeditions,
        },
        params: {
          admin: {
            type: "bool",
            value: false,
          },
        },
        projectRequired: true,
        loginRequired: true,
      },
    },
    {
      state: 'expeditions.list',
      config: {
        url: '/expeditions',
        template: require('./expeditions.html'),
        onEnter: expeditionsOnEnter,
        controller: ExpeditionsController,
        controllerAs: 'vm',
      },
    },
    {
      state: 'expeditions.detail',
      config: {
        url: '/expeditions/:id',
        template: require('./expedition-detail.html'),
        onEnter: expeditionDetailOnEnter,
        controller: ExpeditionController,
        controllerAs: 'vm',
        redirectTo: "expeditions.detail.settings",
        resolve: {
          expedition: resolveExpedition,
          backState: function () {
            return "expeditions.list"
          },
        },
        params: {
          id: {
            type: "int",
          },
        },
      },
    },
    {
      state: 'expeditions.detail.settings',
      config: {
        url: '/settings',
        views: {
          "details": {
            template: require('./expedition-detail-settings.html'),
            controller: ExpeditionSettingsController,
            controllerAs: 'vm',
          },
        },
      },
    },
    {
      state: 'expeditions.detail.resources',
      config: {
        url: '/resources',
        views: {
          "details": {
            template: require('./expedition-detail-resources.html'),
            controller: ExpeditionResourcesController,
            controllerAs: 'vm',
          },
        },
      },
    },
    {
      state: 'expeditions.detail.members',
      config: {
        url: '/members',
        views: {
          "details": {
            template: require('./expedition-detail-members.html'),
            // controller: "ExpeditionMembersController as vm"
          },
        },
      },
    },
  ];
}

resolveExpeditions.$inject = [ '$state', 'ProjectService', 'ExpeditionService' ];

function resolveExpeditions($state, ProjectService, ExpeditionService) {
  return ProjectService.waitForProject()
    .then(function () {
      return ExpeditionService.userExpeditions(true)
        .then(function (response) {
          return response.data;
        }, function () {
          return $state.go('home');
        })
    }, function () {
      return $state.go('home');
    });
}

resolveExpedition.$inject = [ '$state', 'expeditions', '$transition$' ];

function resolveExpedition($state, expeditions, $transition$) {
  for (var i = 0; i < expeditions.length; i++) {
    if (expeditions[ i ].expeditionId === $transition$.params().id) {
      return expeditions[ i ];
    }
  }

  $state.go('expeditions.list');
}

expeditionsOnEnter.$inject = [ '$rootScope', '$state' ];

function expeditionsOnEnter($rootScope, $state) {
  $rootScope.$on('$projectChangeEvent', function () {
    $state.reload('expeditions');
  });
}

expeditionDetailOnEnter.$inject = [ '$rootScope', '$state' ];

function expeditionDetailOnEnter($rootScope, $state) {
  $rootScope.$on('$projectChangeEvent', function () {
    $state.go('expeditions.list', {}, { reload: true, inherit: false });
  });
}

const routing = (routerHelper) => {
  'ngInject';

  routerHelper.configureStates(getStates());
  routerHelper.redirect('/secure/expeditions.jsp', 'expeditions');
  routerHelper.redirect('/secure/expeditions', 'expeditions');
};

export default routing;
