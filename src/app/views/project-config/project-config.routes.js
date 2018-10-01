import angular from 'angular';

function getStates() {
  return [
    {
      state: 'project-config',
      config: {
        url: '/config',
        redirectTo: 'project-config.settings',
        component: 'fimsProjectConfig',
        parent: 'projectView',
        projectRequired: true,
        loginRequired: true,
        resolve: {
          isNetworkAdmin: /* @ngInject */ (UserService, NetworkService) =>
            NetworkService.get()
              .then(
                network =>
                  network.user.userId === UserService.currentUser().userId,
              )
              .catch(r => {
                angular.catcher('Failed to load network')(r);
                return false;
              }),
        },
      },
    },

    // Settings
    {
      state: 'project-config.settings',
      config: {
        url: '/settings',
        views: {
          settings: {
            component: 'fimsProjectConfigSettings',
          },
        },
      },
    },

    // ExpeditionMetadataProperties
    {
      state: 'project-config.expeditionMetadata',
      config: {
        url: '/expedition/properties/',
        views: {
          expeditionMetadata: {
            component: 'fimsProjectConfigExpeditionMetadata',
          },
        },
      },
    },

    // Entities
    {
      state: 'project-config.entities',
      config: {
        url: '/entities',
        views: {
          entities: {
            component: 'fimsProjectConfigEntities',
          },
        },
      },
    },
    {
      state: 'project-config.entities.detail',
      config: {
        url: '/:alias/',
        redirectTo: 'project-config.entities.detail.attributes',
        resolve: {
          entity: /* @ngInject */ ($transition$, $state, ProjectService) => {
            const currentProject = ProjectService.currentProject();
            let e = $transition$.params('to').entity;

            // to === from on a reload. This typically means the project changed
            // so we need to lookup the entity
            if (
              $transition$.$to() === $transition$.$from() ||
              !e.conceptAlias
            ) {
              const { alias } = $transition$.params('to');
              e = currentProject.config.entities.find(
                entity => entity.conceptAlias === alias,
              );
            }

            if (!e) {
              return $state.go('project-config.entities');
            }

            return e;
          },
          networkConfig: /* @ngInject */ (
            $state,
            NetworkConfigurationService,
          ) =>
            NetworkConfigurationService.get().catch(r => {
              angular.catcher(
                'Failed to load the network configuration. Please try again later.',
              )(r);
              return $state.go('project-config.entities');
            }),
        },
        views: {
          'entities@project-config': {
            component: 'fimsEntityDetail',
          },
        },
        params: {
          alias: {
            type: 'string',
          },
          entity: {},
        },
      },
    },

    {
      state: 'project-config.entities.detail.attributes',
      config: {
        url: 'attributes',
        showLoading: false,
        views: {
          attributes: {
            component: 'fimsProjectConfigAttributes',
          },
        },
      },
    },

    {
      state: 'project-config.entities.detail.rules',
      config: {
        url: 'rules',
        showLoading: false,
        views: {
          rules: {
            component: 'fimsProjectConfigRules',
          },
        },
      },
    },
    // - End Entities

    {
      state: 'project-config.lists',
      config: {
        url: '/lists',
        views: {
          lists: {
            component: 'fimsProjectConfigLists',
          },
        },
      },
    },
    {
      state: 'project-config.lists.detail',
      config: {
        url: '/:alias/',
        resolve: {
          list: /* @ngInject */ ($transition$, $state, ProjectService) => {
            const currentProject = ProjectService.currentProject();
            let l = $transition$.params('to').list;

            if (!l.alias) {
              const { alias } = $transition$.params('to');
              l = currentProject.config.lists.find(
                list => list.alias === alias,
              );
            }

            if (!l) {
              return $state.go('project-config.lists');
            }

            return l;
          },
        },
        views: {
          'lists@project-config': {
            component: 'fimsListDetail',
          },
        },
        params: {
          alias: {
            type: 'string',
          },
          list: {},
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};
