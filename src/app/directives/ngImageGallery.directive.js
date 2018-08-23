// this file is a modified version of https://github.com/thatisuday/ng-image-gallery/blob/master/src/js/directive.js
import angular from 'angular';
import ngAnimate from 'angular-animate';
import '../../style/fims/_imageGallery.scss';

// Key codes
const keys = {
  enter: 13,
  esc: 27,
  left: 37,
  right: 39,
};

const ngImageGalleryOptsProvider = () => {
  const defOpts = {
    thumbnails: true,
    thumbSize: 80,
    thumbLimit: false,
    inline: false,
    bubbles: true,
    bubbleSize: 20,
    imgBubbles: false,
    bgClose: false,
    piracy: true,
    imgAnim: 'fadeup',
    textValues: {
      imageLoadErrorMsg: undefined,
      deleteButtonTitle: 'Delete this image...',
      editButtonTitle: 'Edit this image...',
      closeButtonTitle: 'Close',
      externalLinkButtonTitle: 'Open image in new tab...',
    },
  };

  return {
    setOpts(newOpts) {
      angular.extend(defOpts, newOpts);
    },
    $get() {
      return defOpts;
    },
  };
};

const ngImageGalleryTrust = /* ngInject */ $sce => (value, type) =>
  // Defaults to treating trusted value as `html`
  $sce.trustAs(type || 'html', value);

const ngRightClick = () => ({
  restrict: 'A',
  scope: false,
  link(scope, element, attrs) {
    element.bind('contextmenu', event => {
      if (scope.piracy == false) {
        event.preventDefault();
        return scope.piracy;
      }
    });
  },
});

const showImageAsync = () => ({
  restrict: 'A',
  scope: false,
  link(scope, element, attributes) {
    const sources = scope.$eval(attributes.showImageAsync).filter(s => !!s);

    function loadSource(src) {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        scope.$apply(() => {
          if (attributes.asyncKind === 'thumb') {
            element.css({
              backgroundImage: `url("${src}")`,
            });
            element.empty(); // remove loading animation element
          } else if (attributes.asyncKind === 'bubble') {
            element.css({
              backgroundImage: `url("${src}")`,
            });
          }
        });
      };
      image.onerror = () => {
        // attempt to load all sources
        if (sources.length > 0) {
          loadSource(sources.shift());
        } else {
          element.addClass('missing-image');
          element.css({
            backgroundSize: `${scope.bubbleSize / 2}px`,
          });
          element.empty(); // remove loading animation element
        }
      };
    }

    loadSource(sources.shift());
  },
});

const bubbleAutoFit = /* ngInject */ ($window, $timeout) => ({
  restrict: 'A',
  scope: false,
  link: {
    pre(scope, element, attributes) {
      const autoFitBubbles = (force = false) => {
        const scrollerWidth = element[0].getBoundingClientRect().width;
        if (scrollerWidth === 0) return;

        const bubbleSize = scope.bubbleSize;

        // if we've already set the bubbleMargin & we can still see all the bubbles
        // don't re-adjust the margin
        if (!force && scope._bubbleMargin) {
          const match = scope._bubbleMargin.match(/0 (\d\.\d)px/);
          if (match) {
            const bubbleSpace = bubbleSize + Number(match[1]) * 2;
            const rawQuotient = scrollerWidth / bubbleSpace;
            if (rawQuotient >= scope.images.length) return;
          }
        }

        const minMargin = 4 + 4; // left+right
        const bubbleSpace = bubbleSize + minMargin;
        const rawQuotient = scrollerWidth / bubbleSpace;
        const bubblesInView = Math.floor(rawQuotient);
        const extraSpace = scrollerWidth - bubblesInView * bubbleSpace;
        const extraMargin = extraSpace / bubblesInView;
        const bubbleMargin = minMargin + extraMargin;
        const finalBubbleSpace = bubbleMargin + bubbleSize;

        scope._bubblesInView = bubblesInView;
        scope._finalBubbleSpace = finalBubbleSpace;
        scope._bubbleMargin = `0 ${bubbleMargin / 2}px`;

        scope._safeApply(angular.noop);
      };

      $timeout(autoFitBubbles);

      angular.element($window).bind('resize', () => {
        $timeout(autoFitBubbles.bind(true));
      });
      scope.$watch('inline', () => {
        $timeout(autoFitBubbles);
      });
      scope.$watch('bubbleSize', () => {
        $timeout(autoFitBubbles.bind(true));
      });
      scope.$watchCollection('images', () => {
        $timeout(autoFitBubbles);
      });
    },
  },
});

const bubbleAutoScroll = /* ngInject */ ($window, $timeout) => ({
  restrict: 'A',
  scope: false,
  link(scope, element, attributes) {
    const indexCalc = () => {
      const relativeIndexToBubbleWrapper =
        scope._bubblesInView - (scope._bubblesInView - scope._activeImageIndex);

      $timeout(() => {
        if (relativeIndexToBubbleWrapper > scope._bubblesInView - 2) {
          const outBubbles =
            scope._activeImageIndex + 1 - scope._bubblesInView + 1;

          if (scope._activeImageIndex != scope.images.length - 1) {
            scope._bubblesContainerMarginLeft = `-${scope._finalBubbleSpace *
              outBubbles}px`;
          } else {
            scope._bubblesContainerMarginLeft = `-${scope._finalBubbleSpace *
              (outBubbles - 1)}px`;
          }
        } else {
          scope._bubblesContainerMarginLeft = '0px';
        }
      });
    };

    angular.element($window).bind('resize', () => {
      $timeout(indexCalc);
    });
    scope.$watch('_bubblesInView', () => {
      $timeout(indexCalc);
    });
    scope.$watch('_activeImageIndex', () => {
      $timeout(indexCalc);
    });
    scope.$watchCollection('images', () => {
      $timeout(indexCalc);
    });
  },
});

const ngImageGallery = /* ngInject */ (
  $rootScope,
  $timeout,
  $q,
  ngImageGalleryOpts,
) => ({
  replace: true,
  transclude: false,
  restrict: 'AE',
  scope: {
    images: '=', // []
    methods: '=?', // {}
    conf: '=?', // {}

    thumbnails: '=?', // true|false
    thumbSize: '=?', // px
    thumbLimit: '=?', // px
    inline: '=?', // true|false
    bubbles: '=?', // true|false
    bubbleSize: '=?', // px
    imgBubbles: '=?', // true|false
    bgClose: '=?', // true|false
    piracy: '=?', // true|false
    imgAnim: '@?', // {name}
    textValues: '=?', // {}

    onOpen: '&?', // function
    onClose: '&?', // function,
    onDelete: '&?',
    onEdit: '&?',
  },
  template:
    '<div class="ng-image-gallery img-move-dir-{{_imgMoveDirection}}" ng-class="{inline:inline}" ng-hide="images.length == 0">' +
    // Thumbnails container
    //  Hide for inline gallery
    '<div ng-if="thumbnails && !inline" class="ng-image-gallery-thumbnails">' +
    '<div class="thumb" ng-repeat="image in images track by image.id" ng-if="thumbLimit ? $index < thumbLimit : true" ng-click="methods.open($index);" show-image-async="[\'{{image.thumbUrl}}\',\'{{image.url}}\']" title="{{image.title}}" async-kind="thumb" ng-style="{\'width\' : thumbSize+\'px\', \'height\' : thumbSize+\'px\'}">' +
    '<div class="loader"></div>' +
    '</div>' +
    '</div>' +
    // Modal container
    // (inline container for inline modal)
    '<div class="ng-image-gallery-modal" ng-if="opened" ng-cloak>' +
    // Gallery backdrop container
    // (hide for inline gallery)
    '<div class="ng-image-gallery-backdrop" ng-if="!inline"></div>' +
    // Gallery contents container
    // (hide when image is loading)
    '<div class="ng-image-gallery-content" ng-show="!imgLoading" ng-click="backgroundClose($event);">' +
    // actions icons container
    '<div class="actions-icons-container">' +
    // Delete image icon
    '<div class="delete-img" ng-repeat="image in images track by image.id" ng-if="_activeImg == image && image.deletable" title="{{textValues.deleteButtonTitle}}" ng-click="_deleteImg(image)"></div>' +
    // Edit image icon
    '<div class="edit-img" ng-repeat="image in images track by image.id" ng-if="_activeImg == image && image.editable" title="{{textValues.editButtonTitle}}" ng-click="_editImg(image)"></div>' +
    '</div>' +
    // control icons container
    '<div class="control-icons-container">' +
    // External link icon
    // '<a class="ext-url" ng-repeat="image in images track by image.id" ng-if="_activeImg == image && image.extUrl" href="{{image.extUrl}}" target="_blank" title="{{textValues.externalLinkButtonTitle}}"></a>' +
    // Close Icon (hidden in inline gallery)
    '<div class="close" ng-click="methods.close();" ng-if="!inline"  title="{{textValues.closeButtonTitle}}"></div>' +
    '</div>' +
    // Prev-Next Icons
    // Add `bubbles-on` class when bubbles are enabled (for offset)
    '<div class="prev" ng-click="methods.prev();" ng-class="{\'bubbles-on\':bubbles}" ng-hide="images.length == 1"></div>' +
    '<div class="next" ng-click="methods.next();" ng-class="{\'bubbles-on\':bubbles}" ng-hide="images.length == 1"></div>' +
    // Galleria container
    '<div class="galleria">' +
    // Images container
    `<div class="galleria-images img-anim-{{imgAnim}} img-move-dir-{{_imgMoveDirection}}">
      <!-- (show when image cannot be loaded) -->
      <div class="ng-image-gallery-errorplaceholder" ng-show="imgError">
        <div ng-if="textValues.imageLoadErrorMsg" class="ng-image-gallery-error-placeholder" ng-bind-html="textValues.imageLoadErrorMsg | ngImageGalleryTrust"></div>
        <div ng-if="inline && !textValues.imageLoadErrorMsg" class="ng-image-gallery-error-placeholder missing-image"></div>
        <a ng-if="!inline && !textValues.imageLoadErrorMsg" class="ng-image-gallery-error-placeholder missing-image" href="{{_activeImg.extUrl}}" target="_blank"></a>
      </div>
      <a ng-if="!inline" ng-repeat="image in images track by image.id" href="{{image.extUrl}}" target="_blank">
        <img class="galleria-image" ng-right-click ng-if="!imgError && _activeImg == image" ng-src="{{image._loadedSrc}}" ondragstart="return false;" ng-attr-alt="{{image.alt || undefined}}"/>
      </a>
      <img class="galleria-image" ng-right-click ng-click="_openModal()" ng-repeat="image in images track by image.id" ng-if="!imgError && inline && _activeImg == image" ng-src="{{image._loadedSrc}}" ondragstart="return false;" ng-attr-alt="{{image.alt || undefined}}"/>
    </div>` +
    // Image description container
    `<div ng-if="!inline" class="galleria-title-description-wrapper">
      <div ng-repeat="image in images track by image.id" ng-if="(image.title || image.desc) && (_activeImg == image)">
        <div class="title" ng-if="image.title" ng-bind-html="image.title | ngImageGalleryTrust"></div>
        <div class="desc" ng-if="image.desc" ng-bind-html="image.desc | ngImageGalleryTrust"></div>
      </div>
    </div>` +
    // Bubble navigation container
    '<div class="galleria-bubbles-wrapper" ng-if="bubbles && !imgBubbles" ng-hide="images.length == 1" ng-style="{\'height\' : bubbleSize+\'px\'}" bubble-auto-fit>' +
    '<div class="galleria-bubbles" bubble-auto-scroll ng-style="{\'margin-left\': _bubblesContainerMarginLeft}">' +
    '<span class="galleria-bubble" ng-click="_setActiveImg(image);" ng-repeat="image in images track by image.id" ng-class="{active : (_activeImg == image)}" ng-style="{\'width\' : bubbleSize+\'px\', \'height\' : bubbleSize+\'px\', margin: _bubbleMargin}"></span>' +
    '</div>' +
    '</div>' +
    // Image bubble navigation container
    '<div class="galleria-bubbles-wrapper" ng-if="bubbles && imgBubbles" ng-hide="images.length == 1" ng-style="{\'height\' : bubbleSize+\'px\'}" bubble-auto-fit>' +
    '<div class="galleria-bubbles" bubble-auto-scroll ng-style="{\'margin-left\': _bubblesContainerMarginLeft}">' +
    "<span class=\"galleria-bubble img-bubble\" ng-click=\"_setActiveImg(image);\" ng-repeat=\"image in images track by image.id\" ng-class=\"{active : (_activeImg == image)}\" show-image-async=\"['{{image.bubbleUrl }}','{{ image.thumbUrl }}','{{ image.url }}','{{ image.extUrl }}']\" async-kind=\"bubble\" ng-style=\"{'width' : bubbleSize+'px', 'height' : bubbleSize+'px', 'border-width' : bubbleSize/10+'px', margin: _bubbleMargin}\"></span>" +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // Loading animation overlay container
    // (show when image is loading)
    '<div class="ng-image-gallery-loader" ng-show="imgLoading">' +
    '<div class="spinner">' +
    '<div class="rect1"></div>' +
    '<div class="rect2"></div>' +
    '<div class="rect3"></div>' +
    '<div class="rect4"></div>' +
    '<div class="rect5"></div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>',

  link: {
    pre(scope, elem, attr) {
      let openInlineOnClose = false;
      /*
               *	Operational functions
              * */

      // Show gallery loader
      scope._showLoader = () => {
        scope.imgLoading = true;
      };

      // Hide gallery loader
      scope._hideLoader = () => {
        scope.imgLoading = false;
      };

      // Image load complete promise
      scope._loadImg = function loadImg(imgObj) {
        // Return rejected promise
        // if not image object received
        if (!imgObj) return $q.reject();

        const deferred = $q.defer();

        // Show loader
        if (!imgObj.hasOwnProperty('cached')) scope._showLoader();

        function load(src) {
          // Process image
          const img = new Image();
          img.src = src;
          img.onload = function onload() {
            // Hide loader
            if (!imgObj.hasOwnProperty('cached')) scope._hideLoader();

            // Cache image
            if (!imgObj.hasOwnProperty('cached')) imgObj.cached = true;

            // Set the loaded src
            imgObj._loadedSrc = src;

            deferred.resolve(imgObj);
          };
          img.onerror = function onerror() {
            // attempt to load extUrl if imgObj.url fails
            if (imgObj.extUrl && src !== imgObj.extUrl) {
              load(imgObj.extUrl);
              return;
            }

            if (!imgObj.hasOwnProperty('cached')) scope._hideLoader();

            deferred.reject('Error when loading img');
          };
        }

        load(imgObj.url);

        return deferred.promise;
      };

      scope._setActiveImg = imgObj => {
        // Get images move direction
        if (
          scope.images.indexOf(scope._activeImg) -
            scope.images.indexOf(imgObj) ==
            scope.images.length - 1 ||
          (scope.images.indexOf(scope._activeImg) -
            scope.images.indexOf(imgObj) <=
            0 &&
            scope.images.indexOf(scope._activeImg) -
              scope.images.indexOf(imgObj) !=
              -(scope.images.length - 1))
        ) {
          scope._imgMoveDirection = 'forward';
        } else {
          scope._imgMoveDirection = 'backward';
        }

        // Load image
        scope._loadImg(imgObj).then(
          imgObj => {
            scope._activeImg = imgObj;
            scope._activeImageIndex = scope.images.indexOf(imgObj);
            scope.imgError = false;
          },
          () => {
            scope._activeImg = imgObj;
            scope._activeImageIndex = scope.images.indexOf(imgObj);
            scope.imgError = true;
          },
        );
      };

      scope._safeApply = function _sageApply(fn) {
        const phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
          if (fn && typeof fn === 'function') {
            fn();
          }
        } else {
          this.$apply(fn);
        }
      };

      scope._deleteImg = img => {
        const _deleteImgCallback = function() {
          const index = scope.images.indexOf(img);
          console.log(index);
          scope.images.splice(index, 1);
          scope._activeImageIndex = 0;

          /**/
        };

        scope.onDelete({ img, cb: _deleteImgCallback });
      };

      scope._editImg = function(img) {
        if (!scope.inline) scope.methods.close();

        scope.onEdit({ img });
      };

      scope._openModal = () => {
        if (scope.inline) {
          scope.inline = false;
          scope.thumbnails = false;
          openInlineOnClose = true;
          scope.methods.open(scope._activeImageIndex);
        }
      };

      /** ************************************************ */

      /*
               *	Gallery settings
              * */

      // Modify scope models
      scope.images = scope.images != undefined ? scope.images : [];
      scope.methods = scope.methods != undefined ? scope.methods : {};
      scope.conf = scope.conf != undefined ? scope.conf : {};

      // setting options
      scope.$watchCollection('conf', conf => {
        scope.thumbnails =
          conf.thumbnails != undefined
            ? conf.thumbnails
            : scope.thumbnails != undefined
              ? scope.thumbnails
              : ngImageGalleryOpts.thumbnails;
        scope.thumbSize =
          conf.thumbSize != undefined
            ? conf.thumbSize
            : scope.thumbSize != undefined
              ? scope.thumbSize
              : ngImageGalleryOpts.thumbSize;
        scope.thumbLimit =
          conf.thumbLimit != undefined
            ? conf.thumbLimit
            : scope.thumbLimit != undefined
              ? scope.thumbLimit
              : ngImageGalleryOpts.thumbLimit;
        scope.inline =
          conf.inline != undefined
            ? conf.inline
            : scope.inline != undefined
              ? scope.inline
              : ngImageGalleryOpts.inline;
        scope.bubbles =
          conf.bubbles != undefined
            ? conf.bubbles
            : scope.bubbles != undefined
              ? scope.bubbles
              : ngImageGalleryOpts.bubbles;
        scope.bubbleSize =
          conf.bubbleSize != undefined
            ? conf.bubbleSize
            : scope.bubbleSize != undefined
              ? scope.bubbleSize
              : ngImageGalleryOpts.bubbleSize;
        scope.imgBubbles =
          conf.imgBubbles != undefined
            ? conf.imgBubbles
            : scope.imgBubbles != undefined
              ? scope.imgBubbles
              : ngImageGalleryOpts.imgBubbles;
        scope.bgClose =
          conf.bgClose != undefined
            ? conf.bgClose
            : scope.bgClose != undefined
              ? scope.bgClose
              : ngImageGalleryOpts.bgClose;
        scope.piracy =
          conf.piracy != undefined
            ? conf.piracy
            : scope.piracy != undefined
              ? scope.piracy
              : ngImageGalleryOpts.piracy;
        scope.imgAnim =
          conf.imgAnim != undefined
            ? conf.imgAnim
            : scope.imgAnim != undefined
              ? scope.imgAnim
              : ngImageGalleryOpts.imgAnim;
        scope.textValues =
          conf.textValues != undefined
            ? conf.textValues
            : scope.textValues != undefined
              ? scope.textValues
              : ngImageGalleryOpts.textValues;
      });

      scope.onOpen = scope.onOpen != undefined ? scope.onOpen : angular.noop;
      scope.onClose = scope.onClose != undefined ? scope.onClose : angular.noop;
      scope.onDelete =
        scope.onDelete != undefined ? scope.onDelete : angular.noop;
      scope.onEdit = scope.onEdit != undefined ? scope.onEdit : angular.noop;

      // If images populate dynamically, reset gallery
      let imagesFirstWatch = true;
      scope.$watchCollection('images', () => {
        if (imagesFirstWatch) {
          imagesFirstWatch = false;
        } else if (scope.images.length) {
          scope._setActiveImg(scope.images[scope._activeImageIndex || 0]);
        }
      });

      // Watch index of visible/active image
      // If index changes, make sure to load/change image
      let activeImageIndexFirstWatch = true;
      scope.$watch('_activeImageIndex', newImgIndex => {
        if (activeImageIndexFirstWatch) {
          activeImageIndexFirstWatch = false;
        } else if (scope.images.length) {
          scope._setActiveImg(scope.images[newImgIndex]);
        }
      });

      // Open modal automatically if inline
      scope.$watch('inline', () => {
        $timeout(() => {
          if (scope.inline) scope.methods.open();
        });
      });

      /** ************************************************ */

      /*
               *	Methods
              * */

      // Open gallery modal
      scope.methods.open = function open(imgIndex) {
        // Open modal from an index if one passed
        if (imgIndex || !openInlineOnClose || !scope._activeImageIndex) {
          scope._activeImageIndex = imgIndex || 0;
        }

        scope.opened = true;

        // set overflow hidden to body
        if (!scope.inline)
          angular.element(document.body).addClass('body-overflow-hidden');

        // call open event after transition
        $timeout(() => {
          scope.onOpen();
        }, 300);
      };

      // Close gallery modal
      scope.methods.close = function close() {
        if (openInlineOnClose) {
          scope.inline = true;
        } else {
          scope.opened = false; // Model closed
        }

        // set overflow hidden to body
        angular.element(document.body).removeClass('body-overflow-hidden');

        // call close event after transition
        $timeout(() => {
          scope.onClose();
          if (!openInlineOnClose) {
            scope._activeImageIndex = 0; // Reset index
          }
        }, 300);
      };

      // Change image to next
      scope.methods.next = function next() {
        if (scope._activeImageIndex == scope.images.length - 1) {
          scope._activeImageIndex = 0;
        } else {
          scope._activeImageIndex += 1;
        }
      };

      // Change image to prev
      scope.methods.prev = function prev() {
        if (scope._activeImageIndex == 0) {
          scope._activeImageIndex = scope.images.length - 1;
        } else {
          scope._activeImageIndex--;
        }
      };

      // Close gallery on background click
      scope.backgroundClose = function backgroundClose(e) {
        if (!scope.bgClose || scope.inline) return;

        const noCloseClasses = [
          'galleria-image',
          'destroy-icons-container',
          'ext-url',
          'close',
          'next',
          'prev',
          'galleria-bubble',
        ];

        // check if clicked element has a class that
        // belongs to `noCloseClasses`
        for (let i = 0; i < e.target.classList.length; i++) {
          if (noCloseClasses.indexOf(e.target.classList[i]) != -1) {
            break;
          } else {
            scope.methods.close();
          }
        }
      };

      /** ************************************************ */

      /*
               *	User interactions
              * */

      // Key events
      angular.element(document).bind('keyup', event => {
        // If inline modal, do not interact
        if (scope.inline) return;

        if (event.which == keys.right || event.which == keys.enter) {
          $timeout(() => {
            scope.methods.next();
          });
        } else if (event.which == keys.left) {
          $timeout(() => {
            scope.methods.prev();
          });
        } else if (event.which == keys.esc) {
          $timeout(() => {
            scope.methods.close();
          });
        }
      });

      // Swipe events
      if (window.Hammer) {
        const hammerElem = new Hammer(elem[0]);
        hammerElem.on('swiperight', ev => {
          $timeout(() => {
            scope.methods.prev();
          });
        });
        hammerElem.on('swipeleft', ev => {
          $timeout(() => {
            scope.methods.next();
          });
        });
        hammerElem.on('doubletap', ev => {
          if (scope.inline) return;

          $timeout(() => {
            scope.methods.close();
          });
        });
      }

      /** ******************************************************** */

      /*
               *	Actions on angular events
              * */

      const removeClassFromDocumentBody = () =>
        angular.element(document.body).removeClass('body-overflow-hidden');

      $rootScope.$on('$stateChangeSuccess', removeClassFromDocumentBody);
      $rootScope.$on('$routeChangeSuccess', removeClassFromDocumentBody);
    },
  },
});

export default angular
  .module('fims.ng-image-gallery', [ngAnimate])
  .provider('ngImageGalleryOpts', ngImageGalleryOptsProvider)
  .filter('ngImageGalleryTrust', ngImageGalleryTrust)
  .directive('ngRightClick', ngRightClick)
  .directive('showImageAsync', showImageAsync)
  .directive('bubbleAutoFit', bubbleAutoFit)
  .directive('bubbleAutoScroll', bubbleAutoScroll)
  .directive('ngImageGallery', ngImageGallery).name;
