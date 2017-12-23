import AddListController from "./list-add.controller";
import EntityRulesController from "./entity-rules.controller";
import ListController from "./list.controller";
import EntityAttributesController from "./entity-attributes.controller";
import EntityController from "./entity.controller";
import AddRuleController from "./rule-add.controller";
import ListsController from "./lists.controller";

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
        resolve: {
          // entities: (config) => Object.assign(config.entities),
        },
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
          // entity: resolveEntity,
        },
        views: {
          "@project.config": {
            template: require('./templates/entity-detail.html'),
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
            template: require('./templates/entity-attributes.html'),
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
            template: require('./templates/entity-rules.html'),
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
            template: require('./templates/add-rule.html'),
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
            template: require('./templates/lists.html'),
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
        // onEnter: listsDetailOnEnter,
        resolve: {
          // list: resolveList,
        },
        views: {
          "@project.config": {
            template: require('./templates/list-detail.html'),
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
            template: require('./templates/add-list.html'),
            controller: AddListController,
            controller: ListController,
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