'use strict';

angular.module('angular-kaarousel', [
    'ngTouch'
  ])

  .directive('kaarousel', function($interval, $window, $timeout) {

    return {

      restrict: 'EA',

      templateUrl: 'src/angular-kaarousel.html',

      transclude: true,

      scope: {
        displayed: '=',
        perSlide: '=',
        autoplay: '=',
        centerActive: '='
      },

      controller: function ($scope, $attrs) {

        $scope.currentIndex = 0;

        $scope.slides = [];
        $scope.elements = [];

        $scope.margin = 0;
        $scope.widths = [];

        $scope.conf = {
          shouldStopAfterUserAction: $scope.stopAfterAction || false,
          centerActive: $scope.centerActive || false,
        };

        $scope.kaarouselStyles = {
          'margin-left': '0px'
        };

        var self = this, conf = $scope.conf;
        
        self.addSlide = function ( item, jElem ) {
          $scope.slides.push(item);
          $scope.elements.push(jElem);

          $scope.widths.push(angular.element(jElem).outerWidth());
        };

        self.computeIndex = function ( index ) {
          var nbItems = $scope.slides.length;

          if ( index >= nbItems ) { index = 0; }

          if ( index < 0 ) { index = nbItems - 1; }

          return index;
        };

        self.goPrev = function ( userAction ) {
          var tmpIndex = $scope.currentIndex - parseInt($scope.perSlide, 10);
          self.setInterval(self.shouldStop());
          return self.goTo(self.computeIndex(tmpIndex));          
        };

        self.goNext = function ( userAction ) {
          var tmpIndex = $scope.currentIndex + parseInt($scope.perSlide, 10);
          self.setInterval(self.shouldStop());
          return self.goTo(self.computeIndex(tmpIndex));
        };

        self.shouldStop = function ( userAction ) {
          if ( $scope.autoplay ) {
            if ( userAction && conf.shouldStopAfterUserAction ) {
              return true;
            }
            return false;
          }
          return true;
        };

        self.goTo = function ( index ) {
          $scope.currentIndex = index;

          var max = $scope.elements.length - $scope.displayed;
          
          $scope.margin = self.getMargin( index, max );

          if ( index === 0 ) { $scope.margin = 0; }

          $scope.kaarouselStyles['margin-left'] = - $scope.margin + 'px';
          return index;
        };

        self.getMargin = function ( index, max ) {
          var margin = 0, watchingUntil = (conf.centerActive && ( $scope.displayed & 1)) ? index - Math.floor( $scope.displayed / 2 ) : index;

          for ( var j = 0; j < $scope.widths.length; j++ ) {
            if ( j < watchingUntil && j < max ) {
              margin += $scope.widths[j];
            }
          }

          return margin;
        };

        self.setInterval = function ( shouldStop ) {
          $interval.cancel($scope.interval);
          $scope.playing = false;

          if ( shouldStop ) { return; }

          $scope.playing = true;
          $scope.interval = $interval(function () {
            self.goNext();
          }, 2000);          
        };

        self.updateWidths = function () {
          for ( var j = 0; j < $scope.elements.length; j++ ) {
            $scope.widths[j] = angular.element($scope.elements[j]).outerWidth();
          }
        };

        self.getStyles = function () {
          return $scope.kaarouselStyles;
        };

        self.getCurrentIndex = function () {
          return $scope.currentIndex;
        };

        self.lastOfItems = function () {
          console.log('LAST ITEM IN NGREPEAT');
        };

        $scope.pause = function () {
          self.setInterval( true );
        };
        $scope.resume = function () {
          self.setInterval( self.shouldStop() );
        };
        this.updateKaarousel = function () {
          self.setInterval( self.shouldStop() );
          self.updateWidths();
          self.goTo($scope.currentIndex);
        };

      },

      link: function (scope, element, attrs, controller) {

        var windowTimeout;

        if ( scope.autoplay && !scope.playing ) {
          controller.setInterval();
        }

        angular.element($window).resize(function () {
          $timeout.cancel(windowTimeout);
          windowTimeout = $timeout(function () {
            controller.updateKaarousel();
          }, 320);
        });

        scope.$watch('displayed', function () {
          self.setInterval( true );
          $timeout(function () {
            controller.updateKaarousel();            
          }, 300)
        });

        scope.$watch('autoplay', function () {
          self.setInterval( true );
          $timeout(function () {
            controller.updateKaarousel();            
          }, 300)
        });
      }

    };

  })

  .directive('kaarouselStyles', function () {
    return {
      
      require: '^kaarousel',

      link: function (scope, iElement, iAttrs, controller) {
        scope.kaarouselStyles = controller.getStyles();
      }
    };
  })

  // KAAROUSEL SLIDES WRAPPER
  .directive('kaarouselWrapper', function () {
    
    return {
    
      require: '^kaarousel',
      scope: true,
    
      link: function (scope, element) {
        scope.wrapperElement = element;
      }
    
    };
  
  })

  // KAAROUSEL SLIDING ELEMENT
  .directive('kaarouselSlider', function () {
    
    return {

      require: '^kaarousel',
      scope: true,
      
      link: function (scope, element) {
        scope.sliderElement = element;
      }

    };

  })

  // KAAROUSEL SLIDE ITEM
  .directive('kaarouselSlide', function () {

    return {
      
      require: '^kaarousel',
      
      link: function (scope, element, attrs, controller) {
        
        controller.addSlide(scope.slide, element);

        if ( scope.$last ) {
          controller.lastOfItems();
        }
        
        scope.checkIndex = function ( index ) {
          return controller.getCurrentIndex() === index;
        };
      }
    
    };

  })

  // KAAROUSEL NAVS
  .directive('kaarouselNav', function () {

    return {

      require: '^kaarousel',
      
      link: function (scope, element) {
        scope.navElement = element;
      }
    
    };

  })

  // PREV NAV
  .directive('kaarouselPrev', function () {

    return {

      require: '^kaarousel',
      
      link: function (scope, element, attrs, controller) {
        scope.goPrev = function () {
          controller.goPrev(true);
        };
      }

    };

  })

  // NEXT NAV
  .directive('kaarouselNext', function () {

    return {

      require: '^kaarousel',
      
      link: function (scope, element, attrs, controller) {
        scope.goNext = function () {
          controller.goNext(true);
        };
      }

    };

  })

  // PAGER
  .directive('kaarouselPager', function () {

    return {

      require: '^kaarousel',
      
      link: function (scope, element, attrs, controller) {
        scope.goTo = function ( index ) {
          controller.setInterval(true && scope.conf.shouldStopAfterUserAction);
          controller.goTo( index );
        };
      }

    };

  });
