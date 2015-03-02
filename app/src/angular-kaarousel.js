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
        onSlide: '&?',
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

        self.move = function ( where ) {
          self.factory.move(where, true);
          if ( self.getSettings().sync !== false ) {
            $scope.sync = self.getFactory().get('activeIndex');
          }
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

      },
      link: function (scope, element, attrs, ctrl) {
        
        var watchTimeout,
            windowTimeout,
            factory = ctrl.getFactory(),
            windowObj = angular.element($window),
            watchers = '[autoplay,timeInterval,displayed,perSlide,centerActive,stopAfterAction,pauseOnHover,minWidth,hideNav,hidePager,navOnHover,pagerOnHover]';

        angular.element(element).addClass('kaarousel');

        ctrl.getSettings();

        scope.move = ctrl.move;
        scope.factory = factory;

        scope.$watchCollection(watchers, function ( newValues, oldValues ) {
          
          $timeout.cancel(watchTimeout);
          watchTimeout = $timeout( function () {
            var reset = false;
            for ( var i = 0; i < 2; i++ ) {
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
            factory.setInterval( true );
          }

          if ( !isNaN(newValue) ) {
            if ( !scope.shouldAnim ) {
              scope.shouldAnim = true;
            }
            factory.move(newValue, false);
          }

          if ( isNaN(newValue) && !isNaN(oldValue) ) {
            ctrl.update( true );
          }

        });

        scope.$on('$destroy', function () {
          factory.setInterval(true);
        });

      }
    };
  });