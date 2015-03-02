'use strict';

angular.module('angular-kaarousel')
  .directive('kaarouselNav', function () {
    return {
      require: '^kaarousel',
      restrict: 'EA',
      link: function(scope, element, attrs, ctrl) {

        var factory = ctrl.getFactory();

        scope.shouldHideNav = factory.get('shouldHideNav');

        var shouldHideNav = function () {
          return factory.get('shouldHideNav') || factory.get('elements').length <= ctrl.getSettings().displayed;
        };

        scope.$watch(function () {
          return ctrl.getSettings();
        }, function () {
          scope.shouldHideNav = shouldHideNav();
        });

        scope.$watch(function () {
          return factory.get('shouldHideNav');
        }, function () {
          scope.shouldHideNav = shouldHideNav();
        });

      }
    };
  })

  .directive('kaarouselPager', function () {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, ctrl) {
        var factory = ctrl.getFactory();
        
        scope.shouldHidePager = factory.get('shouldHidePager');
        
        scope.$watch(function () {
          return factory.get('shouldHidePager');
        }, function ( value ) {
          scope.shouldHidePager = value;
        });

      }
    };
  });