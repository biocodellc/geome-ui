import TemplateController from "./TemplateController";

const routing = (routerHelper) => {
  routerHelper.configureStates(getStates());
};


function getStates() {
  return [
    {
      state: 'template',
      config: {
        url: "/template",
        template: require('./templates.html'),
        controller: TemplateController,
        controllerAs: "vm",
        projectRequired: true,
      },
    },
  ];
}

routing.$inject = [ 'routerHelper' ];

export default routing;
