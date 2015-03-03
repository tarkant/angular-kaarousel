'use strict';

angular.module('angular-kaarousel')
  .directive('kaarouselWrapper', function ( $swipe, $timeout ) {

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
              scope.shouldAnim = false;
              scope.dragging = true;
            });
          },
          move: function ( coords ) {
            if ( !hasEnough() ) { return; }
            $timeout(function () {
              lastCoords = coords;
              scope.addSwipeOffset();
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

  })

  .directive('kaarouselSlider', function ( $compile ) {
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
  });