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
        centerActive: '=',
        timeInterval: '=',
        updateRate: '=',
        stopAfterAction: '=',
      },

      controller: function ($scope) {

        $scope.currentIndex = 0;

        $scope.slides = [];
        $scope.elements = [];

        $scope.swipeThreshold = 50;
        $scope.swipeStageWidth = 200;

        $scope.userAction = false;
        $scope.margin = 0;
        $scope.widths = [];
        $scope.kaarouselStyles = {
          'margin-left': '0px'
        };

        var self = this, conf;
        
        self.getConf = function () {
          conf = $scope.conf = {
            displayed : Math.abs($scope.displayed),
            perSlide : $scope.perSlide,
            autoplay: $scope.autoplay || false,
            centerActive: $scope.centerActive || false,
            timeInterval: $scope.timeInterval || 5000,
            stopAfterAction: $scope.stopAfterAction || false
          };
          return conf;
        };

        self.getConf();

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

        self.goPrev = function ( userAction, strength ) {
          var index = $scope.currentIndex - ( strength || parseInt(conf.perSlide, 10));
          return self.navTo( index , userAction);
        };

        self.goNext = function ( userAction, strength ) {
          var index = $scope.currentIndex + ( strength || parseInt(conf.perSlide, 10));
          return self.navTo( index , userAction);
        };

        self.navTo = function ( index, ua ) {
          if ( ua ) { $scope.userAction = true; }
          self.setInterval(self.shouldStop());
          return self.goTo(self.computeIndex(index));          
        };

        self.shouldStop = function () {
          if ( $scope.autoplay ) {
            if ( ($scope.userAction && conf.stopAfterAction) || $scope.pausedByUser ) {
              return true;
            }
            return false;
          }
          return true;
        };

        self.goTo = function ( index ) {

          var max = $scope.elements.length - conf.displayed;

          $timeout( function () {
            $scope.currentIndex = index;
            $scope.margin = index === 0 ? index : self.getMargin( index, max );
            $scope.kaarouselStyles['margin-left'] = - $scope.margin + 'px';
          });

          return index;
        };

        self.move = function ( offset ) {
          $timeout(function () {
            var max = $scope.elements.length - conf.displayed;
            var tmpMargin = self.getMargin( $scope.currentIndex, max ) + offset;
            $scope.kaarouselStyles['margin-left'] = - tmpMargin + 'px';
          });
        };

        self.getMargin = function ( index, max ) {
          var margin = 0, watchingUntil = self.getWatchUntil(index);

          for ( var j = 0; j < $scope.widths.length; j++ ) {
            if ( j < watchingUntil && j < max ) {
              margin += $scope.widths[j];
            }
          }

          return margin;
        };

        self.getWatchUntil = function ( index ) {
          if ( conf.centerActive && ( conf.displayed & 1) ) {
            index = index - Math.floor( conf.displayed / 2 );
          }
          return index;
        };

        self.setInterval = function ( shouldStop ) {
          $interval.cancel($scope.interval);
          $scope.playing = false;

          if ( shouldStop ) { return; }

          $scope.playing = true;
          $scope.interval = $interval(function () {
            self.goNext();
          }, conf.timeInterval);          
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
          $scope.pausedByUser = true;
          self.setInterval( true );
        };
        $scope.resume = function () {
          $scope.pausedByUser = false;
          self.setInterval( self.shouldStop() );
        };
        this.updateKaarousel = function () {
          self.setInterval( self.shouldStop() );
          self.updateWidths();
          self.goTo($scope.currentIndex);
        };

      },

      link: function (scope, element, attrs, controller) {

        var windowTimeout, watchTimeout;

        if ( scope.autoplay && !scope.playing ) {
          controller.setInterval();
        }

        // Update on window resize
        angular.element($window).resize(function () {
          $timeout.cancel(windowTimeout);
          windowTimeout = $timeout(function () {
            controller.updateKaarousel();
          }, 320);
        });

        // Update when those guys change
        scope.$watchCollection('[autoplay, displayed, centerActive, timeInterval, stopAfterAction]', function () {
          $timeout.cancel(watchTimeout);
          watchTimeout = $timeout( function () {
            controller.getConf();
            controller.updateKaarousel();
          }, scope.updateRate);
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
  .directive('kaarouselWrapper', function ( $swipe, $timeout ) {
    
    return {
    
      require: '^kaarousel',
      scope: true,
    
      link: function (scope, element, attrs, controller) {
        scope.wrapperElement = element;
        scope.isMoving = false;

        var startCoords, lastCoords;

        var shouldSwipe = function () {
          return startCoords && lastCoords && Math.abs( startCoords.x - lastCoords.x ) > scope.swipeThreshold;
        };

        var getStrength = function () {
          return Math.floor( Math.abs( startCoords.x - lastCoords.x ) / scope.swipeStageWidth ) + 1;
        };

        scope.swipeNext = function () {
          if ( shouldSwipe() ) {
            controller.goNext(true, getStrength());
          }
        };
        scope.swipePrev = function () {
          if ( shouldSwipe() ) {
            controller.goPrev(true, getStrength());
          }
        };
        scope.addSwipeOffset = function () {
          var offset = startCoords.x - lastCoords.x;
          controller.move(offset);
        };
        scope.resetSwipe = function () {
          controller.goTo(scope.currentIndex);
        };

        scope.swipeHandler = $swipe.bind(element, {
          start: function ( coords ) {
            $timeout(function () {
              startCoords = coords;
              lastCoords = null;
              scope.isMoving = true;              
            });
          },
          move: function ( coords ) {
            $timeout(function () {
              lastCoords = coords;
              scope.addSwipeOffset();
              scope.isMoving = true;
            });
          },
          end: function ( coords ) {
            $timeout(function () {
              lastCoords = coords;
              var displacement = startCoords.x - lastCoords.x;
              if ( !displacement ) {
                scope.resetSwipe();
              } else {
                if ( displacement > 0 ) {
                  scope.swipeNext();
                } else {
                  scope.swipePrev();
                }
              }
              scope.isMoving = false;
            });
          },
          cancel: function () {
            scope.resetSwipe();
          }
        });
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

        scope.itemWidth = function() {
          return 100 / controller.getConf().displayed;
        };        
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
          controller.setInterval( controller.shouldStop() );
          controller.goTo( index );
        };
      }
    };
  });