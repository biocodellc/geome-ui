export default function($mdThemingProvider, $mdIconProvider) {
  'ngInject';

  $mdThemingProvider
    .theme('default')
    // .primaryPalette('light-blue')
    .primaryPalette('blue')
    .accentPalette('blue-grey')
    .warnPalette('orange');

  $mdIconProvider.defaultFontSet('FontAwesome').fontSet('fa', 'FontAwesome');
}
