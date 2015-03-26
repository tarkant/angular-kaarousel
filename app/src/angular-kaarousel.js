'use strict';

angular.module('angular-kaarousel', ['ngTouch'])

  .directive('kaarousel', function (KaarouselFactory, $timeout, $interval, $window) {
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
      controller: function ( $scope, $element, $attrs ) {

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

          factory.set('elements', self.elements);
          factory.set('slides', self.slides);
          factory.set('sizes', self.sizes);

          if ( factory.get('isReady') ) {
            factory.update();
          } else {
            self.setSettings();
          }

          factory.set('isReady', true);
          $scope.shouldAnim = true;

          if ( self.settings.autoplay && !self.playing ) {
            self.getFactory().setInterval();
          }


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

      },
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
  });
