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