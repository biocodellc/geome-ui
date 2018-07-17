function getStates() {
  return [
    {
      state: 'project.config',
      config: {
        url: '/config',
        redirectTo: 'project.config.entities',
        views: {
          'details@project': {
            component: 'fimsProjectConfig',
          },
        },
      },
    },
    {
      state: 'project.config.metadata',
      config: {
        url: '/metadata',
        views: {
          metadata: {
            component: 'fimsProjectConfigMetadata',
          },
        },
      },
    },

    // ExpeditionMetadataProperties
    {
      state: 'project.config.expeditionMetadata',
      config: {
        url: '/expedition/properties/',
        views: {
          expeditionMetadata: {
            component: 'fimsExpeditionMetadataPropertiesList',
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
          entities: {
            component: 'fimsProjectConfigEntities',
          },
        },
      },
    },
    {
      state: 'project.config.entities.add',
      config: {
        url: '/add',
        views: {
          'entities@project.config': {
            component: 'fimsProjectConfigEntityAdd',
          },
        },
      },
    },

    {
      state: 'project.config.entities.detail',
      config: {
        url: '/:alias/',
        redirectTo: 'project.config.entities.detail.attributes',
        resolve: {
          entity: /* @ngInject */ ($transition$, $state, ProjectService) => {
            const currentProject = ProjectService.currentProject();
            let e = $transition$.params('to').entity;

            if (!e.conceptAlias) {
              const alias = $transition$.params('to').alias;
              e = currentProject.config.entities.find(
                e => e.conceptAlias === alias,
              );
            }

            if (!e) {
              return $state.go('project.config.entities');
            }

            return e;
          },
        },
        views: {
          'detail@project.config': {
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
      state: 'project.config.entities.detail.attributes',
      config: {
        url: 'attributes',
        views: {
          attributes: {
            component: 'fimsEntityAttributes',
          },
        },
        params: {
          addAttribute: {
            type: 'bool',
          },
        },
      },
    },

    {
      state: 'project.config.entities.detail.rules',
      config: {
        url: 'rules',
        resolve: {
          lists: /* @ngInject */ ProjectService =>
            ProjectService.currentProject().config.lists.map(l => l.alias),
          columns: /* @ngInject */ entity =>
            entity.attributes.map(a => a.column),
        },
        views: {
          rules: {
            component: 'fimsEntityRules',
          },
        },
      },
    },
    {
      state: 'project.config.entities.detail.rules.add',
      config: {
        url: '/add',
        views: {
          'rules@project.config.entities.detail': {
            component: 'fimsProjectConfigRuleAdd',
          },
        },
      },
    },
    // - End Entities

    {
      state: 'project.config.lists',
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
      state: 'project.config.lists.detail',
      config: {
        url: '/:alias/',
        resolve: {
          list: /* @ngInject */ ($transition$, $state, ProjectService) => {
            const currentProject = ProjectService.currentProject();
            let l = $transition$.params('to').list;

            if (!l.alias) {
              const alias = $transition$.params('to').alias;
              l = currentProject.config.lists.find(l => l.alias === alias);
            }

            if (!l) {
              return $state.go('project.config.lists');
            }

            return l;
          },
          addField: /* @ngInject */ $transition$ =>
            $transition$.params('to').addField,
        },
        views: {
          'detail@project.config': {
            component: 'fimsListDetail',
          },
        },
        params: {
          alias: {
            type: 'string',
          },
          addField: {
            type: 'bool',
          },
          list: {},
        },
      },
    },
    {
      state: 'project.config.lists.add',
      config: {
        url: '/add',
        views: {
          'lists@project.config': {
            component: 'fimsAddList',
          },
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};
