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
        pauseOnHover: '=',
        centerActive: '=',
        timeInterval: '=',
        updateRate: '=',
        stopAfterAction: '=',
        hideNav: '=',
        hidePager: '=',
        navOnHover: '=',
        pagerOnHover: '=',
        swipable: '=kaaSwipable',
        sync: '=',
        rtl: '=',
        data: '='
      },

      controller: function ($scope) {

        var self = this, conf;

        $scope.slides = [];
        $scope.elements = [];

        $scope.currentIndex = 0;

        $scope.swipeThreshold = 50;
        $scope.swipeStageWidth = 200;

        $scope.shouldAnim = false;

        $scope.userAction = false;
        $scope.margin = 0;
        $scope.widths = [];
        $scope.sliderMargin = {
          'margin-left': '0px'
        };
        
        self.getConf = function () {
          conf = {
            displayed : self.computeDisplayed(),
            perSlide : self.computePerSlides(),
            autoplay: $scope.autoplay,
            pauseOnHover: $scope.pauseOnHover || false,
            centerActive: $scope.centerActive || false,
            timeInterval: $scope.timeInterval || 3000,
            stopAfterAction: $scope.stopAfterAction || false,
            hideNav: $scope.hideNav || false,
            hidePager: $scope.hidePager || false,
            navOnHover: $scope.navOnHover || false,
            pagerOnHover: $scope.pagerOnHover || false,
            swipable: $scope.swipable,
            sync: $scope.sync,
            rtl: $scope.rtl || false
          };
          return conf;
        };

        self.computeDisplayed = function () {
          var displayed = $scope.displayed;
          if ( displayed === undefined || isNaN(displayed) ) {
            displayed = 3;
          }
          if ( displayed > $scope.elements.length ) {
            displayed = $scope.elements.length;
          }
          return Math.abs(displayed);
        };

        self.computePerSlides = function () {
          var perSlide = Math.abs($scope.perSlide);
          if ( perSlide === undefined || isNaN(perSlide) ) {
            perSlide = 1;
          }
          if ( $scope.rtl ) {
            perSlide = - perSlide;
          }
          return perSlide;
        };

        conf = self.getConf();

        self.addSlide = function ( item, jElem ) {
          $scope.slides.push(item);
          $scope.elements.push(jElem);
          $scope.widths.push(angular.element(jElem).outerWidth());

          if ( conf.rtl ) {
            $scope.currentIndex = $scope.elements.length - 1;
          }
        };

        self.computeIndex = function ( index ) {
          var nbItems = $scope.slides.length;
          if ( index >= nbItems ) { index = 0; }
          if ( index < 0 ) { index = nbItems - 1; }
          return index;
        };

        self.goPrev = function ( userAction, strength ) {
          var index = $scope.currentIndex - ( strength || parseInt(conf.perSlide, 10));
          if ( userAction && conf.stopAfterAction ) { 
            $scope.userAction = true;
          }
          self.setInterval(self.shouldStop());
          return self.goTo(self.computeIndex(index));          
        };

        self.goNext = function ( userAction, strength ) {
          var index = $scope.currentIndex + ( strength || parseInt(conf.perSlide, 10));
          if ( userAction && conf.stopAfterAction ) { 
            $scope.userAction = true;
          }
          self.setInterval(self.shouldStop());
          return self.goTo(self.computeIndex(index));          
        };

        self.shouldStop = function () {
          if ( conf.autoplay ) {
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
            $scope.margin = self.getMargin( index, max );
            $scope.sliderMargin['margin-left'] = - $scope.margin + 'px';
          });

          return index;
        };

        self.move = function ( offset ) {
          $timeout(function () {
            var max = $scope.elements.length - conf.displayed;
            var tmpMargin = self.getMargin( $scope.currentIndex, max ) + offset;
            $scope.sliderMargin['margin-left'] = - tmpMargin + 'px';
          });
        };

        self.getMargin = function ( index, max ) {
          var nbItems = $scope.widths.length, 
              watchingUntil = self.getWatchUntil(index),
              margin = 0, j;

          if ( !conf.rtl ) {
            for ( j = 0; j < $scope.widths.length; j++ ) {
              if ( j < watchingUntil && j < max ) {
                margin += $scope.widths[j];
              }
            }
          } else {
            // RTL handler
            // TODO this is not working properly
            // but it hurts my brain a little
            for ( var i = 0; i < nbItems; i++ ) {
              margin += $scope.widths[i];
            }
            for ( j = nbItems; j > 0 ; j-- ) {
              if ( ( nbItems - j - 2 < nbItems - watchingUntil ) ) {
                margin -= $scope.widths[j - 1];
              }
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

          if ( shouldStop || conf.sync || conf.sync === 0 ) { return; }

          $scope.playing = true;
          $scope.interval = $interval( function () {
            $scope.shouldAnim = true;
            self.goNext();
          }, conf.timeInterval);
        };

        self.updateWidths = function () {
          for ( var j = 0; j < $scope.elements.length; j++ ) {
            $scope.widths[j] = angular.element($scope.elements[j]).outerWidth();
          }
        };

        self.getStyles = function () {
          return $scope.sliderMargin;
        };

        self.getCurrentIndex = function () {
          return $scope.currentIndex;
        };

        self.lastOfItems = function () {
          self.goTo(self.getCurrentIndex());
          if ( conf.autoplay && !$scope.playing ) {
            self.setInterval();
          }
        };

        this.updateKaarousel = function ( resetInterval ) {
          self.getConf();
          if ( resetInterval ) {
            self.setInterval( self.shouldStop() );
          }
          self.updateWidths();
          self.goTo($scope.currentIndex);
        };

        $scope.pause = function () {
          $scope.pausedByUser = true;
          self.setInterval( true );
        };

        $scope.resume = function () {
          $scope.pausedByUser = false;
          self.setInterval( self.shouldStop() );
        };

        $scope.mouseEnterCallback = function () {
          if ( $scope.pauseOnHover ) {
            $scope.pause();
          }
          if ( $scope.navOnHover ) {
            $scope.hideNav = false;
          }
          if ( $scope.pagerOnHover ) {
            $scope.hidePager = false;
          }
        };

        $scope.mouseLeaveCallback = function () {
          if ( !$scope.stopAfterHover && $scope.pauseOnHover ) { 
            $scope.resume();
          }
          if ( $scope.navOnHover ) {
            $scope.hideNav = true;
          }
          if ( $scope.pagerOnHover ) {
            $scope.hidePager = true;
          }
        };

      },

      link: function (scope, element, attrs, controller) {

        var windowTimeout, watchTimeout, 
            watchers = '[autoplay, timeInterval, sync, displayed, perSlide, centerActive, stopAfterAction, pauseOnHover, rtl]';

        angular.element(element).addClass('kaarousel');

        // Update on window resize
        angular.element($window).resize(function () {
          $timeout.cancel(windowTimeout);
          windowTimeout = $timeout(function () {
            controller.updateKaarousel(true);
          }, scope.updateRate || 500);
        });

        // Update when those guys change
        scope.$watchCollection(watchers, function ( newValues, oldValue ) {
          $timeout.cancel(watchTimeout);
          watchTimeout = $timeout( function () {
            var shouldResetInterval;

            // If time interval or autoplay or sync as changed we should reset the timer
            // have to hard code the position of the values though ...
            for ( var i = 0; i < 3; i++ ) {
              if ( newValues[i] !== oldValue[i] ) {
                shouldResetInterval = true;
                break;
              }
            }
            
            // Update kaarousel
            controller.updateKaarousel(shouldResetInterval);
          }, scope.updateRate);
        });

        scope.$watch('sync', function () {
          if ( !isNaN(scope.sync) ) {
            scope.shouldAnim = true;
            if ( !scope.pausedByUser ) {
              controller.goTo(scope.sync);
            }
          }
        });
      }
    };
  })

  // KAAROUSEL SLIDES WRAPPER
  .directive('kaarouselWrapper', function ( $swipe, $timeout ) {
    
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, controller) {
        
        var startCoords, lastCoords;

        var shouldSwipe = function () {
          return startCoords && lastCoords && Math.abs( startCoords.x - lastCoords.x ) > scope.swipeThreshold;
        };

        var getStrength = function () {
          return Math.floor( Math.abs( startCoords.x - lastCoords.x ) / scope.swipeStageWidth ) + 1;
        };

        scope.wrapperElement = element;

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
            if ( !scope.swipable ) { return; }
            $timeout(function () {
              startCoords = coords;
              lastCoords = null;
              scope.shouldAnim = false;
              scope.dragging = true;
            });
          },
          move: function ( coords ) {
            if ( !scope.swipable ) { return; }
            $timeout(function () {
              lastCoords = coords;
              scope.addSwipeOffset();
              scope.shouldAnim = false;
              scope.dragging = true;
            });
          },
          end: function ( coords ) {
            if ( !scope.swipable ) { return; }
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
              scope.shouldAnim = true;
              scope.dragging = false;
            });
          },
          cancel: function () {
            if ( !scope.swipable ) { return; }
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
      link: function (scope, element) {
        // REGISTER ELEMENT
        scope.sliderElement = element;
      }
    };
  })

  .directive('kaarouselDummy', function () {
    return {
      restrict: 'EAC',
      require: '^kaarousel',
      link: function (scope, element, attrs, controller) {
        angular.element(element).addClass('dummy');
        scope.kaarouselMargin = controller.getStyles();
      }
    };
  })

  // KAAROUSEL SLIDE ITEM
  .directive('kaarouselSlide', function () {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, controller) {

        // REGISTER ITEM
        controller.addSlide(scope.slide, element);
        angular.element(element).addClass('kaarousel-slide');

        if ( scope.$last ) { controller.lastOfItems(); }

        scope.$watch('displayed', function () {
          scope.kaarouselItemWidth = {
          };          
        });

        scope.itemStyles = function ( index ) {
          return {
            'width' : (100 / scope.displayed) + '%'
          };
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
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, controller) {
        // REGISTER ELEMENT
        scope.navElement = element;

        scope.goPrev = function () {
          controller.goPrev(true);
        };
        scope.goNext = function () {
          controller.goNext(true);
        };
      }
    };
  })

  // PREV NAV
  .directive('kaarouselPrev', function () {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function () {
        // DO STUFF WHEN CLICK ON PREV 
      }
    };
  })

  // NEXT NAV
  .directive('kaarouselNext', function () {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function () {
        // DO STUFF WHEN CLICK ON NEXT 
      }
    };
  })

  // PAGER
  .directive('kaarouselPager', function () {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, controller) {
        scope.goTo = function ( index ) {
          if(scope.stopAfterAction){
            scope.userAction = true;
          }
          controller.setInterval( controller.shouldStop() );
          controller.goTo( index );
        };
      }
    };
  });