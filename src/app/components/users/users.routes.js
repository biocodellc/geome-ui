import ProfileController from "./ProfileController";
import NewUserController from "./NewUserController";
import ResetPassController from "./ResetPassController";

const routing = (routerHelper) => {
  routerHelper.configureStates(getStates());
};


function getStates() {
  return [
    {
      state: 'resetPass',
      config: {
        url: "/resetPass",
        template: require('./resetPass.html'),
        controller: ResetPassController,
        controllerAs: 'vm',
      },
    },
    {
      state: 'reset',
      config: {
        url: "/reset",
        template: require('./reset.html')
      },
    },
    {
      state: 'create',
      config: {
        url: "/user/create?id&email",
        template: require('./create.html'),
        controller: NewUserController,
        controllerAs: 'vm',
      },
    },
    {
      state: 'profile',
      config: {
        url: "/user/profile",
        template: require('./profile.html'),
        controller: ProfileController,
        controllerAs: 'vm',
        loginRequired: true,
      },
    },
  ];
}

routing.$inject = [ 'routerHelper' ];

export default routing;
