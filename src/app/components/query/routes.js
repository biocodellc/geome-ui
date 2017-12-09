const routing = (routerHelper) => {
  routerHelper.configureStates(getStates());
};

function getStates() {
  return [
    {
      state: 'query',
      config: {
        url: '/query',
        template: require('.query.html'),
        controller: "QueryController",
        controllerA: "queryVm",
        projectRequired: true,
      }
    }
  ];
}

routing.$inject = ['routerHelper'];

export default routing;
