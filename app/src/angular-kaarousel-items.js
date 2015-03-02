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
