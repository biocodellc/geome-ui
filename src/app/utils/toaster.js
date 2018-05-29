import angular from 'angular';
import '../../style/fims/_toast.scss';

export default $mdToast => {
  let currentToast;
  let toastCnt = 0;

  const toast = (msg, action, toastClass) => {
    toastCnt += 1;

    const t = $mdToast
      .simple()
      .textContent(msg)
      .position('bottom right')
      .toastClass(toastClass)
      .parent(angular.element('#toast-container'));

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
    error(msg, action) {
      return toast(msg, action, 'error');
    },

    success(msg, action) {
      return toast(msg, action, 'success');
    },
  };

  Object.setPrototypeOf(toast, ext);

  return toast;
};
