'use strict';

angular.module('angular-kaarousel')
  .directive('kaarouselSlide', function () {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, ctrl) {

        var parentScope = ctrl.getParentScope(), repeatRule;

        angular.element(element).addClass('kaarousel-slide');

        if ( attrs.ngRepeat ) {
          repeatRule = attrs.ngRepeat.split(' ')[0];
        }

        ctrl.addSlide(element, repeatRule ? scope[repeatRule] : null);

        if ( scope.$last ) { ctrl.reachedLastItem(); }

        scope.isActive = ctrl.getFactory().activeIndex === scope.$index;

        scope.itemStyles = function () {
          var conf = ctrl.getSettings(),
              modulo = scope.$index % conf.displayed,
              itemWidth = 100 / conf.displayed,
              styles = {
                'width' : (100 / conf.displayed ) + '%'
              };

          if ( conf.animation === 'shuffle' ) {
            styles.left = Math.abs( modulo ) * ( itemWidth ) + ( scope.isVisible() ? 0 : 100 ) + '%';
          }
          if ( conf.animation === 'fade' ) {
            styles.left = modulo * itemWidth + '%';
          }
          return styles;
        };

        scope.isVisible = function ( index ) {
          return false;
        };

        parentScope.$on('updateIndex', function ( event, index ) {
          scope.isActive = index === scope.$index;
        });
      }
    };
  });
