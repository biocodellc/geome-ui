import '../../../style/fims/_home.scss';

const template = require('./home.html');

class HomeController {
  constructor($state) {
    'ngInject';

    this.$state = $state;
  }

  playAudio() {
    const geomeSound = new Audio('docs/geome.mp3');
    geomeSound.play();
  }
}

export default {
  template,
  controller: HomeController,
  bindings: {
    layout: '@',
  },
};
