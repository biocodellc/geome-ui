/* eslint-disable no-param-reassign, no-underscore-dangle */

/**
 * Modifies the $mdDialog service to register the dialog for later retrieval.
 * This is similar to how mdSidenav works.
 *
 * A `componentId` can be provided to the $mdDialog.show function. This wll
 * cause the dialog to be registered for later retrieval using $mdDialog(componentId);
 *
 * TODO Note: due to limitations in $mdDialog, we can only close/cancel the latest dialog.
 * There doesn't appear to be a way to close a specific dialog instance.
 */
const decorate = ($mdComponentRegistry, $mdDialog) => {
  const dialog = componentId => $mdComponentRegistry.get(componentId);
  // const deregisters = {};

  const getComponentId = function getComponentId() {
    return this._componentId;
  };

  const setComponentId = function setComponentId(id) {
    this._componentId = id;
    return this;
  };

  const extension = {
    show(opts, ...args) {
      const componentId = opts._options
        ? opts.getComponentId()
        : opts.componentId;

      // const origOnShow = opts._options ? opts._options.onShow : opts.onShow;

      // const onShow = (scope, element, x, controller) => {
      //   if (controller.__proto__.constructor.name === 'MdDialogController') {
      //     controller.abort = () => $mdDialog.cancel(componentId);
      //     controller.hide = () =>
      //       $mdDialog.hide(
      //         componentId,
      //         controller.$type == 'prompt' ? controller.result : true,
      //       );
      //   }
      //   if (origOnShow) origOnShow();
      // };

      // if (opts._options) opts.onShow(onShow);
      // else opts.onShow = onShow;

      const d = super.show(opts, ...args);

      if (componentId) {
        const deregister = $mdComponentRegistry.register(d, componentId);
        d.finally(deregister);
      }

      return d;
    },

    // hide(componentId, ...args) {
    //   if (componentId) {
    //     const d = $mdComponentRegistry.get(componentId);
    //     if (d) return d.hide(...args);

    //     return Promise.resolve();
    //   }

    //   return super.hide(...args);
    // },

    // cancel(componentId, ...args) {
    //   if (componentId) {
    //     const d = $mdComponentRegistry.get(componentId);
    //     if (d) return d.cancel(...args);

    //     return Promise.resolve();
    //   }

    //   return super.cancel(...args);
    // },

    alert(componentId) {
      const a = super.alert();
      a.componentId = setComponentId;
      a.getComponentId = getComponentId;
      a.componentId(componentId);
      return a;
    },

    prompt(componentId) {
      const p = super.prompt();
      p.componentId = setComponentId;
      p.getComponentId = getComponentId;
      p.componentId(componentId);
      return p;
    },

    confirm(componentId) {
      const c = super.confirm();
      c.componentId = setComponentId;
      c.getComponentId = getComponentId;
      c.componentId(componentId);
      return c;
    },
  };

  Object.setPrototypeOf(extension, $mdDialog);
  Object.setPrototypeOf(dialog, extension);

  return dialog;
};

export default $provide => {
  'ngInject';

  $provide.decorator('$mdDialog', ($delegate, $mdComponentRegistry) =>
    decorate($mdComponentRegistry, $delegate),
  );
};
