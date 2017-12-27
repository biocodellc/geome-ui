function getStates() {
  return [
    {
      state: 'project.config',
      config: {
        url: '/config',
        redirectTo: 'project.config.entities',
        // onExit: configExit,
        views: {
          "details": {
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
          "objects": {
            component: 'fimsProjectConfigMetadata',
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
            component: 'fimsProjectConfigEntities',
          },
        },
      },
    },
    {
      state: 'project.config.entities.add',
      config: {
        url: '/add',
        resolve: {
          entities: /*ngInject*/ (currentProject) => currentProject.config.entities.map(c => c.conceptAlias),
        },
        views: {
          "objects@project.config": {
            component: 'fimsProjectConfigEntitiesAdd',
          },
        },
      },
    },

    {
      state: 'project.config.entities.detail',
      config: {
        url: '/:alias/',
        // onEnter: entitiesDetailOnEnter,
        redirectTo: "project.config.entities.detail.attributes",
        resolve: {
          entity: /*ngInject*/ ($transition$, currentProject) => {
            const alias = $transition$.params('to').alias;
            const e = currentProject.config.entities.find(e => e.conceptAlias === alias);
            return Object.assign({}, e);
          },
        },
        views: {
          "@project.config": {
            component: 'fimsEntityDetail',
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
            component: 'fimsEntityAttributes',
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
        resolve: {
          lists: /*ngInject*/ (currentProject) => currentProject.config.lists.map(l => l.alias),
          columns: /*ngInject*/ (entity) => entity.attributes.map(a => a.column),
        },
        views: {
          "objects": {
            component: 'fimsEntityRules',
          },
        },
      },
    },
    {
      state: 'project.config.entities.detail.rules.add',
      config: {
        url: '/add',
        resolve: {
          lists: /*ngInject*/ (currentProject) => currentProject.config.lists.map(l => l.alias),
          columns: /*ngInject*/ (entity) => entity.attributes.map(a => a.column),
        },
        views: {
          "add-rule@project.config.entities.detail": {
            component: 'fimsProjectConfigRuleAdd',
          },
        },
      },
    },
    //- End Entities

    {
      state: 'project.config.lists',
      config: {
        url: '/lists',
        resolve: {
          lists: /*ngInject*/ (currentProject) => currentProject.config.lists,
        },
        views: {
          "objects": {
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
          list: /*ngInject*/ ($transition$, currentProject) => {
            const alias = $transition$.params('to').alias;
            const l = currentProject.config.lists.find(l => l.alias === alias);
            return Object.assign({}, l);
          },

        },
        views: {
          "@project.config": {
            component: 'fimsListDetail',
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
            component: 'fimsAddList',
          },
        },
      },
    },
  ]
}

export default (routerHelper) => {
  'ngInject';
  routerHelper.configureStates(getStates());
};