'use strict';

angular.module('angular-kaarousel', ['ngTouch'])

  .directive('kaarousel', ["KaarouselFactory", "$timeout", "$interval", "$window", function (KaarouselFactory, $timeout, $interval, $window) {
    return {
      restrict: 'EA',
      scope: {
        displayed: '=?',
        perSlide: '=?',
        autoplay: '=?',
        pauseOnHover: '=?',
        centerActive: '=?',
        timeInterval: '=?',
        transitionDuration: '=?',
        updateRate: '=?',
        stopAfterAction: '=?',
        hideNav: '=?',
        hidePager: '=?',
        navOnHover: '=?',
        pagerOnHover: '=?',
        isSwipable: '=?',
        sync: '=?',
        data: '=?',
        animation: '=?',
        loop: '=?',
        options: '=?',
        afterSlide: '@?',
        beforeSlide: '@?',
        minWidth: '=?',
        expand: '=?'
      },
      templateUrl: 'src/angular-kaarousel.html',
      transclude: true,
      controller: ["$scope", "$element", "$attrs", function ( $scope, $element, $attrs ) {

        var self = this;

        self.update = function ( reset ) {
          self.setSettings();
          self.getFactory().update(reset);
        };

        self.updateSync = function () {
          if ( self.getSettings().sync !== null ) {
            $scope.sync = self.getFactory().get('activeIndex');
          }
        };

        self.move = function ( where ) {
          self.factory.move(where, true);
          self.updateSync();
          $scope.$broadcast('updateIndex', self.getFactory().get('activeIndex'));
        };

        self.setSettings = function () {
          self.settings = self.getFactory().makeConf($attrs, $scope);
          return self.settings;
        };

        self.getSettings = function () {
          if ( !self.settings ) {
            self.setSettings();
          }
          return self.settings;
        };

        self.getParentScope = function () {
          return $scope;
        };

        self.getFactory = function () {
          if ( !self.factory ) {
            self.factory = new KaarouselFactory();
            self.factory.set('scope', $scope);
          }
          return self.factory;
        };

        self.register = function ( what, value ) {
          self.getFactory().set(what, value);
        };

        self.reachedLastItem = function () {

          var factory = self.getFactory();

          if ( factory.get('isReady') ) {
            factory.update();
          }

          factory.set('isReady', true);
          $scope.shouldAnim = true;

          if ( self.settings.autoplay && !self.playing ) {
            self.getFactory().setInterval();
          }

          self.getFactory().set('elements', self.elements);
          self.getFactory().set('slides', self.slides);
          self.getFactory().set('sizes', self.sizes);

        };

        self.addSlide = function ( element, data ) {

          var aElement = angular.element(element);

          self.elements = self.elements || [];
          self.slides = self.slides || [];
          self.sizes = self.sizes || [];

          self.elements.push(element);

          if ( data ) {
            self.slides.push(data);
          }

          self.sizes.push({
            width: aElement.outerWidth(),
            height: aElement.outerHeight()
          });

        };

      }],
      link: function (scope, element, attrs, ctrl) {
        
        var watchTimeout,
            windowTimeout,
            isSyncing = false,
            factory = ctrl.getFactory(),
            windowObj = angular.element($window),
            watchers = '[autoplay,timeInterval,loop,displayed,perSlide,centerActive,stopAfterAction,pauseOnHover,minWidth,hideNav,hidePager,navOnHover,pagerOnHover,transitionDuration,expand]';

        angular.element(element).addClass('kaarousel');

        ctrl.getSettings();

        scope.move = ctrl.move;
        scope.factory = factory;

        scope.$watchCollection(watchers, function ( newValues, oldValues ) {
          $timeout.cancel(watchTimeout);
          watchTimeout = $timeout( function () {
            var reset = false;
            for ( var i = 0; i < 3; i++ ) {
              if ( newValues[i] !== oldValues[i] ) {
                reset = true;
                break;
              }
            }
            ctrl.update(reset);
          }, ctrl.getSettings().updateRate);
        });

        scope.$watch(function () {
          return windowObj.width();
        }, function () {
          $timeout.cancel(windowTimeout);
          windowTimeout = $timeout(function () {
            ctrl.update(true);
          }, ctrl.getSettings().updateRate || 500);
        });

        scope.$watch('sync', function ( newValue, oldValue ) {

          newValue = parseInt(newValue, 10);
          oldValue = parseInt(oldValue, 10);

          if ( !isNaN(newValue) && isNaN(oldValue) ) {
            isSyncing = true;
            factory.setInterval( true );
          }

          if ( !isNaN(newValue) ) {
            if ( !scope.shouldAnim ) {
              scope.shouldAnim = true;
            }
            factory.move(newValue, false);
          }

          if ( isNaN(newValue) && !isNaN(oldValue) && !isSyncing ) {
            ctrl.update(true);
            isSyncing = false;
          }

        });

        scope.$on('$destroy', function () {
          factory.setInterval(true);
        });

      }
    };
  }]);
'use strict';

angular.module('angular-kaarousel')
  .service('KaarouselFactory', ["$interval", "$timeout", function ($interval, $timeout) {

    var _pi = function( value ) {
      return parseInt(value, 10);
    };
    
    var KaarouselFactory = function () {
      var self = this;

      self.settings = {};

      self.activeIndex = 0;
      self.interval = 0;

      self.sliderDomElement = null;

      self.slides = [];
      self.elements = [];
      self.sizes = [];

      self.isReady = false;
      self.hasStarted = false;
      self.userAction = null;
      self.pausedByUser = null;
    };

    KaarouselFactory.prototype.defaultSettings = {
      displayed: 3,
      perSlide: 1,
      autoplay: true,
      pauseOnHover: true,
      centerActive: false,
      timeInterval: 3000,
      transitionDuration: 500,
      stopAfterAction: false,
      hideNav: false,
      hidePager: false,
      navOnHover: false,
      pagerOnHover: false,
      isSwipable: true,
      sync: false,
      animation: 'slide',
      loop: true,
      afterSlide: null,
      beforeSlide: null,
      minWidth: null,
      expand: true,
      updateRate: 100
    };

    KaarouselFactory.prototype.set = function ( what, value ) {
      this[what] = value;
    };

    KaarouselFactory.prototype.get = function ( what ) {
      return this[what] !== undefined ? this[what] : null;
    };

    KaarouselFactory.prototype.makeConf = function ( attrs, scope ) {

      var lookFor = [
        'displayed',
        'perSlide',
        'autoplay',
        'pauseOnHover',
        'centerActive',
        'timeInterval',
        'transitionDuration',
        'stopAfterAction',
        'hideNav',
        'hidePager',
        'navOnHover',
        'pagerOnHover',
        'isSwipable',
        'sync',
        'animation',
        'loop',
        'minWidth',
        'afterSlide',
        'beforeSlide',
        'expand'
      ], options = {};

      var parse = [
        'displayed',
        'perSlide',
        'minWidth',
        'timeInterval',
        'transitionDuration'
      ];

      for (var i = lookFor.length - 1; i >= 0; i--) {
        if ( lookFor[i] in attrs ) {
          if ( scope[lookFor[i]] !== undefined ) {
            options[lookFor[i]] = lookFor[i] in parse ? _pi(scope[lookFor[i]]) : scope[lookFor[i]];
          }
        }
      }

      if ( scope.options ) {
        options = angular.extend(scope.options, options);
      }

      options = angular.extend(angular.copy(this.defaultSettings), options);

      options.displayed = this.computeDisplayed(options);
      options.perSlide = this.computePerSlides(options);

      this.settings = options;

      this.shouldHideNav = this.settings.hideNav;
      this.shouldHidePager = this.settings.hidePager;

      return options;

    };

    KaarouselFactory.prototype.computeDisplayed = function ( conf ) {

      var minWidth = _pi(conf.minWidth || 0),
          confDisp = Math.abs(Math.ceil(conf.displayed)), out;

      if ( minWidth > 0 && this.sliderDomElement ) {
        out = Math.floor( this.sliderDomElement.outerWidth() / minWidth ) || 1;
      }

      if ( !out || out > confDisp ) {
        out = confDisp;
      }

      if ( this.elements.length > out && out > confDisp ) {
        return confDisp;
      }

      if ( out === confDisp && this.elements.length < out && conf.expand ) {
        return this.elements.length;
      }

      return out;
    };

    KaarouselFactory.prototype.computePerSlides = function ( conf ) {
      var out = Math.abs(Math.ceil(conf.perSlide)),
          ref = conf.displayed;

      if ( conf.animation !== 'slide' || out > ref ) {
        out = ref;
      }

      return out;
    };

    KaarouselFactory.prototype.computeIndex = function(index, direction, strength) {
      var self = this;
      var nextIndex = index + (direction === 'next' ? self.settings.perSlide : - self.settings.perSlide);
      
      this.stoppedAtEnd = false;

      if ( nextIndex >= self.elements.length ) {
        if ( self.settings.loop ) {
          return 0;
        } else {
          this.stoppedAtEnd = true;
          return index;
        }
      }
      if ( nextIndex <= - (self.settings.perSlide) ) {
        if ( self.settings.loop ) {
          return self.elements.length - 1;
        } else {
          this.stoppedAtEnd = true;
          return index;
        }
      }
      if ( nextIndex < 0 ) {
        return 0;
      }
      return nextIndex;
    };

    KaarouselFactory.prototype.hideNavs = function() {
      this.shouldHideNext = false;
      this.shouldHidePrev = false;
      if ( this.settings.loop ) { return; }
      this.shouldHideNext = this.activeIndex >= this.elements.length - this.settings.displayed;
      this.shouldHidePrev = this.activeIndex < this.settings.perSlide;
    };

    KaarouselFactory.prototype.move = function( where, isUserAction, preventCallback, strength ) {
      var self = this, currentslideindex = self.activeIndex;

      self.hasStarted = true;


      // Set userAction to true if needed
      if ( isUserAction && this.settings.stopAfterAction ) {
        this.userAction = true;
      }
      
      switch ( where ) {
        case 'next':
        case 'prev':
          self.activeIndex = self.computeIndex(self.activeIndex, where, strength);
          break;
        default:
          self.activeIndex = _pi(where);
          break;
      }

      // Reset The Interval
      this.setInterval(this.shouldStop());

      this.hideNavs();
      this.sliderMargin = - self.getMargin();

      if ( currentslideindex === self.activeIndex ) { return; }

      // Call Callback Functions
      if ( !preventCallback && self.settings.beforeSlide ) {
        if ( typeof self.scope.$parent[self.settings.beforeSlide] === 'function' ) {
          self.scope.$parent[self.settings.beforeSlide](currentslideindex, self.activeIndex);
        }
      }
      
      if ( !preventCallback && self.settings.afterSlide ) {
        $timeout(function () {
          if ( typeof self.scope.$parent[self.settings.afterSlide] === 'function' ) {
            self.scope.$parent[self.settings.afterSlide](self.activeIndex);
          }
        }, self.settings.transitionDuration);
      }
    };

    KaarouselFactory.prototype.getStyles = function() {

      this.updateSizes();

      var styles = {};
      if ( this.activeIndex !== null ) {
        if ( this.settings.animation === 'slide' ) {
          styles = {
            'margin-left': this.sliderMargin || 0 + 'px'
          };
        } else {
          if ( this.isReady ) {
            styles = {
              'height': this.sizes[this.activeIndex].height
            };
          }
        }
      }
      styles['transition-duration'] = this.settings.transitionDuration / 1000 + 's';
      return styles;
    };

    KaarouselFactory.prototype.setInterval = function( stopping ) {
      var self = this;

      $interval.cancel(self.interval);
      self.playing = false;

      self.hideNavs();

      if ( stopping || self.settings.sync || self.settings.sync === 0 ) { return; }

      self.interval = $interval( function () {
        self.stoppedAtEnd = false;
        self.playing = true;
        self.move('next');
      }, self.settings.timeInterval);
    };

    KaarouselFactory.prototype.shouldStop = function() {
      if ( this.settings.autoplay ) {
        if ( (this.userAction && this.settings.stopAfterAction) || this.pausedByUser || this.stoppedAtEnd ) {
          return true;
        }
        return false;
      }
      return true;
    };

    KaarouselFactory.prototype.updateSizes = function () {
      for ( var j = 0; j < this.elements.length; j++ ) {
        var elt = angular.element(this.elements[j]);
        this.sizes[j] = {
          width : elt.outerWidth(),
          height : elt.outerHeight()
        };
      }
    };

    KaarouselFactory.prototype.update = function( reset ) {
      var self = this;
      if ( reset ) {
        this.setInterval( this.shouldStop() );
      }
      this.bindEvents();
      if ( this.hasStarted ) {
        $timeout(function () {
          self.move(self.activeIndex, false, true);          
        }, 100);
      }
    };

    KaarouselFactory.prototype.getMargin = function () {
      var margin = 0;
      for ( var j = 0; j < this.elements.length; j++ ) {
        if ( j < this.loopUntil(this.activeIndex) && j < this.elements.length - this.settings.displayed ) {
          margin += this.sizes[j].width;
        }
      }
      return margin;
    };

    KaarouselFactory.prototype.loopUntil = function ( index ) {
      this.isCentered = false;
      if ( this.settings.centerActive && ( this.settings.displayed & 1) ) {
        index = index - Math.floor( this.settings.displayed / 2 );
        this.isCentered = true;
      }
      return index;
    };

    KaarouselFactory.prototype.shift = function ( offset ) {
      this.sliderMargin = - ( this.getMargin() + offset );
    };

    KaarouselFactory.prototype.removeSlide = function( element ) {
      this.elements.splice(this.elements.indexOf(element), 1);
      this.update();
    };

    KaarouselFactory.prototype.pause = function() {
      this.pausedByUser = true;
      this.setInterval(true);
    };

    KaarouselFactory.prototype.resume = function() {
      if ( this.stoppedAtEnd ) { return; }
      this.pausedByUser = false;
      this.setInterval(this.shouldStop());
    };

    KaarouselFactory.prototype.mouseEnterCallback = function () {
      if ( this.settings.pauseOnHover ) {
        this.pause();
      }
      if ( this.settings.navOnHover ) {
        this.shouldHideNav = false;
      }
      if ( this.settings.pagerOnHover ) {
        this.shouldHidePager = false;
      }
    };

    KaarouselFactory.prototype.mouseLeaveCallback = function () {

      this.wrapperDomElement.trigger('touchend');

      if ( !this.settings.stopAfterHover && this.settings.pauseOnHover ) {
        this.resume();
      }
      if ( this.settings.navOnHover && this.settings.hideNav ) {
        this.shouldHideNav = true;
      }
      if ( this.settings.pagerOnHover && this.settings.hidePager ) {
        this.shouldHidePager = true;
      }
    };

    KaarouselFactory.prototype.bindEvents = function( remove ) {
      
      var self = this;

      var needEvents = this.settings.pauseOnHover || this.settings.pagerOnHover || this.settings.navOnHover;

      if ( remove || !needEvents ) {
        this.wrapperDomElement.unbind();
        this.binded = false;
      }

      if ( !remove && needEvents && !this.binded ) {
        this.binded = true;
        this.wrapperDomElement.bind({
          mouseenter: function () {
            self.mouseEnterCallback();
          },
          mouseleave: function () {
            self.mouseLeaveCallback();
          }
        });
      }
    };

    return KaarouselFactory;

  }]);

'use strict';

angular.module('angular-kaarousel')
  .directive('kaarouselSlide', function () {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, ctrl) {

        var factory = ctrl.getFactory(),
            repeatRule, $i = scope.$index;

        angular.element(element).addClass('kaarousel-slide');

        if ( attrs.ngRepeat ) {
          repeatRule = attrs.ngRepeat.split(' ')[0];
        }

        ctrl.addSlide(element, repeatRule ? scope[repeatRule] : null);

        if ( scope.$last ) { ctrl.reachedLastItem(); }

        scope.isActive = function () {
          return factory.get('activeIndex') === $i;
        };

        scope.itemStyles = function () {
          var conf = ctrl.getSettings(),
              modulo = $i % conf.displayed,
              itemWidth = 100 / conf.displayed,
              styles = {
                'width' : itemWidth + '%'
              };

          if ( conf.animation === 'shuffle' ) {
            styles.left = Math.abs( modulo ) * ( itemWidth ) + ( scope.isVisible() ? 0 : 100 ) + '%';
          }
          if ( conf.animation === 'fade' ) {
            styles.left = modulo * itemWidth + '%';
          }
          return styles;
        };

        scope.isVisible = function () {
          var cu = factory.get('activeIndex'),
              max = factory.get('elements').length,
              disp = ctrl.getSettings().displayed;

          if ( ctrl.getSettings().centerActive && factory.get('isCentered') ) {
            return $i >= cu - Math.floor( disp / 2 ) &&
                   $i <= cu + Math.floor( disp / 2 ) ||
                   ( cu + 1 < disp && $i < disp ) ||
                   ( cu > max - disp - 1 && $i > max - disp - 1);
          } else {
            return ( $i >= cu && $i < cu + disp ) ||
                   ( $i > max - disp - 1 && cu > max - disp - 1 );
          }
        };

        scope.$on('$destroy', function () {
          factory.removeSlide(element);
        });

      }
    };
  });

'use strict';

angular.module('angular-kaarousel')
  .directive('kaarouselNav', function () {
    return {
      require: '^kaarousel',
      restrict: 'EA',
      link: function(scope, element, attrs, ctrl) {

        var factory = ctrl.getFactory();

        scope.shouldHideNav = function () {
          return factory.get('shouldHideNav') || factory.get('elements').length <= ctrl.getSettings().displayed;
        };

        scope.shouldHideNext = function () {
          return factory.get('shouldHideNext');
        };

        scope.shouldHidePrev = function () {
          return factory.get('shouldHidePrev');
        };

      }
    };
  })

  .directive('kaarouselPager', function () {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, ctrl) {
        var factory = ctrl.getFactory();
        
        scope.shouldHidePager = function () {
          return factory.get('shouldHidePager');
        };

      }
    };
  });
'use strict';

angular.module('angular-kaarousel')
  .directive('kaarouselWrapper', ["$swipe", "$timeout", function ( $swipe, $timeout ) {

    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, ctrl) {

        var swipeThreshold = 120,
            swipeStageWidth = 200,
            factory = ctrl.getFactory();

        var startCoords, lastCoords;

        var hasEnough = function () {
          var conf = ctrl.getSettings();
          return conf.isSwipable && ctrl.getFactory().elements.length > conf.displayed;
        };

        var shouldSwipe = function () {
          return startCoords && lastCoords && Math.abs( startCoords.x - lastCoords.x ) > swipeThreshold;
        };

        var getStrength = function () {
          return Math.floor( Math.abs( startCoords.x - lastCoords.x ) / swipeStageWidth ) + 1;
        };

        ctrl.register('wrapperDomElement', element);

        factory.bindEvents();

        scope.addSwipeOffset = function () {
          var offset = startCoords.x - lastCoords.x;
          factory.shift(offset);
        };
        scope.resetSwipe = function () {
          scope.shouldAnim = true;
          scope.dragging = false;
          factory.move(factory.get('activeIndex'), true, true);
        };

        scope.swipeHandler = $swipe.bind(element, {
          start: function ( coords ) {
            if ( !hasEnough() ) { return; }
            $timeout(function () {
              startCoords = coords;
              lastCoords = null;
            });
          },
          move: function ( coords ) {
            if ( !hasEnough() ) { return; }
            $timeout(function () {
              lastCoords = coords;
              scope.addSwipeOffset();
              scope.shouldAnim = false;
              scope.dragging = true;
            });
          },
          end: function () {
            if ( !hasEnough() || !lastCoords ) { return; }
            $timeout(function () {
              var displacement = startCoords.x - lastCoords.x;
              
              scope.shouldAnim = true;
              scope.dragging = false;
              
              if ( shouldSwipe() ) {
                if ( displacement > 0 ) {
                  if ( factory.get('activeIndex') < factory.get('elements').length - 1 ) {
                    factory.move('next', true, false, getStrength());
                  } else {
                    scope.resetSwipe();
                  }
                } else {
                  if ( factory.get('activeIndex') > 0 ) {
                    factory.move('prev', true, false, getStrength());
                  } else {
                    scope.resetSwipe();
                  }
                }
              } else {
                scope.resetSwipe();
              }
              ctrl.updateSync();
            });
          },
          cancel: function () {
            if ( !hasEnough() ) { return; }
            $timeout(function () {
              scope.resetSwipe();
            });
          }
        });
      }
    };

  }])

  .directive('kaarouselSlider', ["$compile", function ( $compile ) {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, ctrl) {

        var dummy = '<kaarousel-dummy class="dummy" ng-style="getStyles()"></kaarousel-dummy>',
            slider = angular.element(element);

        ctrl.register('sliderDomElement', element);
        slider.addClass(ctrl.getSettings().animation + '-animation');

        scope.getStyles = function () {
          return ctrl.getFactory().getStyles();
        };

        $compile(dummy)(scope, function (elt) {
          slider.prepend(elt);
        });

      }
    };
  }]);
(function(module) {
try {
  module = angular.module('angular-kaarousel');
} catch (e) {
  module = angular.module('angular-kaarousel', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/angular-kaarousel.html',
    '<kaarousel-container class="kaarousel-actions-wrapper"><kaarousel-wrapper class="kaarousel-wrapper" ng-class="{anim: shouldAnim, dragging: dragging}"><kaarousel-slider ng-transclude="" class="kaarousel-slider"></kaarousel-slider></kaarousel-wrapper><kaarousel-nav class="kaarousel-nav" ng-class="{\'is-hidden\': shouldHideNav()}"><kaarousel-prev ng-click="move(\'prev\')" ng-class="{\'is-hidden\': shouldHidePrev()}" class="kaarousel-prev">PREV</kaarousel-prev><kaarousel-next ng-click="move(\'next\')" ng-class="{\'is-hidden\': shouldHideNext()}" class="kaarousel-next">NEXT</kaarousel-next></kaarousel-nav><kaarousel-pager class="kaarousel-pager" ng-class="{\'is-hidden\': shouldHidePager()}"><ul><li ng-repeat="i in factory.elements track by $index" ng-click="move($index)" ng-class="{selected: $index === factory.activeIndex}">{{$index}}</li></ul></kaarousel-pager></kaarousel-container>');
}]);
})();
