import angular from 'angular';
import '../../style/fims/_toast.scss';

export default $mdToast => {
  let currentToast;
  let toastCnt = 0;

  const toast = (msg, action, opts) => {
    toastCnt += 1;

    const t = $mdToast
      .simple()
      .textContent(msg)
      .position('bottom right')
      .parent(angular.element(document.querySelector('#toast-container')));

    Object.assign(t._options, opts);

    if (action) {
      t.action(action.name);
    }

    const finished = response => {
      if (action && response === 'ok') action.fn();
      toastCnt -= 1;
      if (toastCnt === 0) currentToast = undefined;
    };

    if (currentToast) {
      currentToast = currentToast.then(() =>
        $mdToast.show(t).then(response => finished(response)),
      );
    } else {
      currentToast = $mdToast.show(t).then(response => finished(response));
    }
  };

  const ext = {
    error(msg, action, opts = {}) {
      if (action && typeof action === 'object') {
        opts = action;
        action = undefined;
      }
      opts.toastClass = opts.toastClass ? `${opts.toastClass} error` : 'error';
      return toast(msg, action, opts);
    },

    success(msg, action, opts = {}) {
      if (action && typeof action === 'object') {
        opts = action;
        action = undefined;
      }
      opts.toastClass = opts.toastClass
        ? `${opts.toastClass} success`
        : 'success';
      return toast(msg, action, opts);
    },
  };

  Object.setPrototypeOf(toast, ext);

  return toast;
};
