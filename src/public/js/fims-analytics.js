// https://github.com/philipwalton/analyticsjs-boilerplate/blob/master/src/analytics/multiple-trackers.js

(function () {
    'use strict';

    /* global ga */

    /**
     * Bump this when making backwards incompatible changes to the tracking
     * implementation. This allows you to create a segment or view filter
     * that isolates only data captured with the most recent tracking changes.
     */

    var TRACKING_VERSION = '1';

    /**
     * A global list of tracker object, including the name and tracking ID.
     * https://support.google.com/analytics/answer/1032385
     */
    var ALL_TRACKERS = [{ name: 'biscicol-fims', trackingId: 'UA-94046921-4' }];

    /**
     * Just the trackers with a name matching `test`. Using an array filter
     * allows you to have more than one test tracker if needed.
     */
    var TEST_TRACKERS = ALL_TRACKERS.filter(function (_ref) {
        var name = _ref.name;
        return (/test/.test(name)
        );
    });

    /**
     * A default value for dimensions so unset values always are reported as
     * something. This is needed since Google Analytics will drop empty dimension
     * values in reports.
     */
    var NULL_VALUE = '(not set)';

    /**
     * A mapping between custom dimension names and their indexes.
     */
    var dimensions = {
        TRACKING_VERSION: 'dimension1',
        CLIENT_ID: 'dimension2',
        WINDOW_ID: 'dimension3',
        HIT_ID: 'dimension4',
        HIT_TIME: 'dimension5',
        HIT_TYPE: 'dimension6',
        HIT_SOURCE: 'dimension7',
        VISIBILITY_STATE: 'dimension8',
        URL_QUERY_PARAMS: 'dimension9'
    };

    /**
     * A mapping between custom metric names and their indexes.
     */
    var metrics = {
        RESPONSE_END_TIME: 'metric1',
        DOM_LOAD_TIME: 'metric2',
        WINDOW_LOAD_TIME: 'metric3',
        PAGE_VISIBLE: 'metric4',
        MAX_SCROLL_PERCENTAGE: 'metric5'
    };

    /**
     * Creates a ga() proxy function that calls commands on all passed trackers.
     * @param {!Array} trackers an array or objects containing the `name` and
     *     `trackingId` fields.
     * @return {!Function} The proxied ga() function.
     */
    var createGaProxy = function createGaProxy(trackers) {
        return function (command) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                var _loop = function _loop() {
                    var name = _step.value.name;

                    if (typeof command == 'function') {
                        ga(function () {
                            command(ga.getByName(name));
                        });
                    } else {
                        ga.apply(undefined, [name + '.' + command].concat(args));
                    }
                };

                for (var _iterator = trackers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    _loop();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        };
    };

    /**
     * Command queue proxies
     * (exported so they can be called by other modules if needed).
     */
    var gaAll = createGaProxy(ALL_TRACKERS);
    var gaTest = createGaProxy(TEST_TRACKERS);

    /**
     * Initializes all the analytics setup. Creates trackers and sets initial
     * values on the trackers.
     */
    var init = function init() {
        // Initialize the command queue in case analytics.js hasn't loaded yet.
        window.ga = window.ga || function () {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                return (ga.q = ga.q || []).push(args);
            };

        createTrackers();
        trackErrors();
        trackCustomDimensions();
        requireAutotrackPlugins();
        sendInitialPageview();
        sendNavigationTimingMetrics();
    };

    /**
     * Creates the trackers and sets the default transport and tracking
     * version fields. In non-production environments it also logs hits.
     */
    var createTrackers = function createTrackers() {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = ALL_TRACKERS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var tracker = _step2.value;

                window.ga('create', tracker.trackingId, 'auto', tracker.name);
            }

            // Ensures all hits are sent via `navigator.sendBeacon()`.
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        gaAll('set', 'transport', 'beacon');
    };

    /**
     * Tracks a JavaScript error with optional fields object overrides.
     * This function is exported so it can be used in other parts of the codebase.
     * E.g.:
     *
     *    `fetch('/api.json').catch(trackError);`
     *
     * @param {Error|undefined} err
     * @param {Object=} fieldsObj
     */
    var trackError = function trackError(err) {
        var fieldsObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        gaAll('send', 'event', Object.assign({
            eventCategory: 'Error',
            eventAction: err.name,
            eventLabel: err.message + '\n' + (err.stack || '(no stack trace)'),
            nonInteraction: true
        }, fieldsObj));
    };

    /**
     * Tracks any errors that may have occured on the page prior to analytics being
     * initialized, then adds an event handler to track future errors.
     */
    var trackErrors = function trackErrors() {
        // Errors that have occurred prior to this script running are stored on
        // `window.__e.q`, as specified in `index.html`.
        var loadErrorEvents = window.__e && window.__e.q || [];

        // Use a different eventCategory for uncaught errors.
        var fieldsObj = { eventCategory: 'Uncaught Error' };

        // Replay any stored load error events.
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = loadErrorEvents[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var event = _step3.value;

                trackError(event.error, fieldsObj);
            }

            // Add a new listener to track event immediately.
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        window.addEventListener('error', function (event) {
            trackError(event.error, fieldsObj);
        });
    };

    /**
     * Sets a default dimension value for all custom dimensions on all trackers.
     */
    var trackCustomDimensions = function trackCustomDimensions() {
        // Sets a default dimension value for all custom dimensions to ensure
        // that every dimension in every hit has *some* value. This is necessary
        // because Google Analytics will drop rows with empty dimension values
        // in your reports.
        Object.keys(dimensions).forEach(function (key) {
            gaAll('set', dimensions[key], NULL_VALUE);
        });

        // Adds tracking of dimensions known at page load time.
        gaAll(function (tracker) {
            var _tracker$set;

            tracker.set((_tracker$set = {}, _defineProperty(_tracker$set, dimensions.TRACKING_VERSION, TRACKING_VERSION), _defineProperty(_tracker$set, dimensions.CLIENT_ID, tracker.get('clientId')), _defineProperty(_tracker$set, dimensions.WINDOW_ID, uuid()), _tracker$set));
        });

        // Adds tracking to record each the type, time, uuid, and visibility state
        // of each hit immediately before it's sent.
        gaAll(function (tracker) {
            var originalBuildHitTask = tracker.get('buildHitTask');
            tracker.set('buildHitTask', function (model) {
                var qt = model.get('queueTime') || 0;
                model.set(dimensions.HIT_TIME, String(new Date() - qt), true);
                model.set(dimensions.HIT_ID, uuid(), true);
                model.set(dimensions.HIT_TYPE, model.get('hitType'), true);
                model.set(dimensions.VISIBILITY_STATE, document.visibilityState, true);

                originalBuildHitTask(model);
            });
        });
    };

    /**
     * Requires select autotrack plugins and initializes each one with its
     * respective configuration options. As an example of using multiple
     * trackers, this function only requires the `maxScrollTracker` and
     * `pageVisibilityTracker` plugins on the test trackers, so you can ensure the
     * data collected is relevant prior to sending it to your production property.
     */
    var requireAutotrackPlugins = function requireAutotrackPlugins() {
        gaAll('require', 'cleanUrlTracker', {
            stripQuery: true,
            queryDimensionIndex: getDefinitionIndex(dimensions.URL_QUERY_PARAMS),
            trailingSlash: 'remove'
        });
        gaTest('require', 'maxScrollTracker', {
            sessionTimeout: 30,
            timeZone: 'America/Los_Angeles',
            maxScrollMetricIndex: getDefinitionIndex(metrics.MAX_SCROLL_PERCENTAGE)
        });
        gaAll('require', 'outboundLinkTracker', {
            events: ['click', 'contextmenu']
        });
        gaTest('require', 'pageVisibilityTracker', {
            visibleMetricIndex: getDefinitionIndex(metrics.PAGE_VISIBLE),
            sessionTimeout: 30,
            timeZone: 'America/Los_Angeles',
            fieldsObj: _defineProperty({}, dimensions.HIT_SOURCE, 'pageVisibilityTracker')
        });
        gaAll('require', 'urlChangeTracker', {
            fieldsObj: _defineProperty({}, dimensions.HIT_SOURCE, 'urlChangeTracker')
        });
    };

    /**
     * Sends the initial pageview to Google Analytics.
     */
    var sendInitialPageview = function sendInitialPageview() {
        gaAll('send', 'pageview', _defineProperty({}, dimensions.HIT_SOURCE, 'pageload'));
    };

    /**
     * Gets the DOM and window load times and sends them as custom metrics to
     * Google Analytics via an event hit.
     */
    var sendNavigationTimingMetrics = function sendNavigationTimingMetrics() {
        // Only track performance in supporting browsers.
        if (!(window.performance && window.performance.timing)) return;

        // If the window hasn't loaded, run this function after the `load` event.
        if (document.readyState != 'complete') {
            window.addEventListener('load', sendNavigationTimingMetrics);
            return;
        }

        var nt = performance.timing;
        var navStart = nt.navigationStart;

        var responseEnd = Math.round(nt.responseEnd - navStart);
        var domLoaded = Math.round(nt.domContentLoadedEventStart - navStart);
        var windowLoaded = Math.round(nt.loadEventStart - navStart);

        // In some edge cases browsers return very obviously incorrect NT values,
        // e.g. 0, negative, or future times. This validates values before sending.
        var allValuesAreValid = function allValuesAreValid() {
            for (var _len3 = arguments.length, values = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                values[_key3] = arguments[_key3];
            }

            return values.every(function (value) {
                return value > 0 && value < 6e6;
            });
        };

        if (allValuesAreValid(responseEnd, domLoaded, windowLoaded)) {
            var _gaTest;

            gaTest('send', 'event', (_gaTest = {
                eventCategory: 'Navigation Timing',
                eventAction: 'track',
                nonInteraction: true
            }, _defineProperty(_gaTest, metrics.RESPONSE_END_TIME, responseEnd), _defineProperty(_gaTest, metrics.DOM_LOAD_TIME, domLoaded), _defineProperty(_gaTest, metrics.WINDOW_LOAD_TIME, windowLoaded), _gaTest));
        }
    };

    /**
     * Accepts a custom dimension or metric and returns it's numerical index.
     * @param {string} definition The definition string (e.g. 'dimension1').
     * @return {number} The definition index.
     */
    var getDefinitionIndex = function getDefinitionIndex(definition) {
        return +/\d+$/.exec(definition)[0];
    };

    /**
     * Generates a UUID.
     * https://gist.github.com/jed/982883
     * @param {string|undefined=} a
     * @return {string}
     */
    var uuid = function b(a) {
        return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
    };

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    init();
})();