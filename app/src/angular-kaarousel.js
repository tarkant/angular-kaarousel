'use strict';

angular.module('angular-kaarousel', [
    'ngTouch'
  ])

  /**

  * Main directive, also the main controller

  * TODO describe that better
  * TODO Add vertical sliding option
  * TODO Add lazyloading
  
  */

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
        data: '=',
        animation: '@'
      },

      controller: function ($scope) {

        var self = this, conf;

        $scope.slides = [];
        $scope.elements = [];
        $scope.sizes = [];

        // Current active index
        $scope.currentIndex = 0;
        // Some variables for the swipe
        $scope.swipeThreshold = 50;
        $scope.swipeStageWidth = 200;
        // Usefull to prevent animation to happen
        $scope.shouldAnim = false;
        // Stocking images when there are some
        $scope.imageCollection = [];
        $scope.loadedImage = 0;
        // To know if user has made any action
        $scope.userAction = false;
        // Current margin on the dummy
        $scope.margin = 0;
        // Formated margin for the ng-style
        $scope.sliderMargin = {
          'margin-left': '0px'
        };

        $scope.defaults = {
          displayed: 3,
          perSlide: 1,
          autoplay: true,
          pauseOnHover: true,
          centerActive: false,
          timeInterval: 3000,
          stopAfterAction: false,
          hideNav: false,
          hidePager: false,
          navOnHover: false,
          pagerOnHover: false,
          swipable: true,
          sync: false,
          rtl: false,
          animation: 'slide'
        };
        
        self.getConf = function () {
          conf = {
            displayed : self.computeDisplayed(),
            perSlide : self.computePerSlides(),
            autoplay: $scope.autoplay,
            pauseOnHover: $scope.pauseOnHover,
            centerActive: $scope.centerActive,
            timeInterval: $scope.timeInterval,
            stopAfterAction: $scope.stopAfterAction,
            hideNav: $scope.hideNav,
            hidePager: $scope.hidePager,
            navOnHover: $scope.navOnHover,
            pagerOnHover: $scope.pagerOnHover,
            swipable: $scope.swipable,
            sync: $scope.sync,
            rtl: $scope.rtl,
            animation: $scope.animation
          };

          for ( var c in conf ) {
            if ( conf[c] === undefined ){
              delete conf[c];
            }
          }
          
          conf = $scope.conf = angular.extend($scope.defaults, conf);

          return conf;
        };

        self.computeDisplayed = function () {
          var displayed = Math.abs(Math.ceil($scope.displayed)) || $scope.defaults.displayed;
          return displayed > $scope.slides.length ? $scope.slides.length : displayed;
        };

        self.computePerSlides = function () {
          var perSlide = Math.abs(Math.ceil($scope.perSlide)) || $scope.defaults.perSlide;
          return $scope.rtl ? - perSlide : perSlide;
        };

        conf = self.getConf();

        self.addSlide = function ( item, jElem ) {
          
          $scope.slides.push(item);
          $scope.elements.push(jElem);

          // Save sizes
          $scope.sizes.push({
            width: angular.element(jElem).outerWidth(),
            height: angular.element(jElem).outerHeight()
          });

          // For RTL conf we should start on last slide
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

        $scope.goPrev = function ( userAction, strength ) {
          var index = $scope.currentIndex - ( strength || parseInt(conf.perSlide, 10));
          if ( userAction && conf.stopAfterAction ) { 
            $scope.userAction = true;
          }
          self.setInterval(self.shouldStop());
          return self.goTo(self.computeIndex(index));          
        };

        $scope.goNext = function ( userAction, strength ) {
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

          var max = $scope.slides.length - conf.displayed;

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
          var nbItems = $scope.slides.length, 
              watchingUntil = self.getWatchUntil(index),
              margin = 0, j;

          if ( !conf.rtl ) {
            for ( j = 0; j < nbItems; j++ ) {
              if ( j < watchingUntil && j < max ) {
                margin += $scope.sizes[j].width;
              }
            }
          } else {
            // RTL handler
            // TODO this is not working properly
            // but it hurts my brain a little
            for ( var i = 0; i < nbItems; i++ ) {
              margin += $scope.sizes[i].width;
            }
            for ( j = nbItems; j > 0 ; j-- ) {
              if ( ( nbItems - j - 2 < nbItems - watchingUntil ) ) {
                margin -= $scope.sizes[j - 1].width;
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

          $scope.interval = $interval( function () {
            $scope.playing = true;
            $scope.shouldAnim = true;
            $scope.goNext();
          }, conf.timeInterval);
        };

        self.updateSizes = function () {
          for ( var j = 0; j < $scope.elements.length; j++ ) {
            $scope.sizes[j] = { 
              width : angular.element($scope.elements[j]).outerWidth(),
              height : angular.element($scope.elements[j]).outerHeight()
            };
          }
        };

        // TODO do that better
        $scope.getStyles = function () {
          var styles = {};
          if ( $scope.animation !== 'fade' ) {
            styles = $scope.sliderMargin;
          } else {
            if ( $scope.isReady ) {
              styles = {
                'height': $scope.sizes[$scope.currentIndex].height
              };
            }
          }
          return styles;
        };

        self.getCurrentIndex = function () {
          return $scope.currentIndex;
        };

        self.lastOfItems = function () {
          $scope.isReady = true;
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
          self.updateSizes();
          self.goTo($scope.currentIndex);
        };

        this.getNbElements = function () {
          return $scope.slides.length;
        };

        this.addImage = function ( image ) {
          $scope.imageCollection.push(image);
          $scope.loadedImage++;
          self.updateSizes();
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
          if ( conf.pauseOnHover ) {
            $scope.pause();
          }
          if ( conf.navOnHover ) {
            $scope.hideNav = false;
          }
          if ( conf.pagerOnHover ) {
            $scope.hidePager = false;
          }
        };

        $scope.mouseLeaveCallback = function () {
          if ( !conf.stopAfterHover && conf.pauseOnHover ) { 
            $scope.resume();
          }
          if ( conf.navOnHover ) {
            $scope.hideNav = true;
          }
          if ( conf.pagerOnHover ) {
            $scope.hidePager = true;
          }
        };

      },

      link: function (scope, element, attrs, controller) {

        var windowTimeout, watchTimeout, 
            watchers = '[autoplay, timeInterval, sync, displayed, perSlide, centerActive, stopAfterAction, pauseOnHover, rtl]';

        angular.element(element).addClass('kaarousel');

        console.log(scope.$id);

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
            // have to hard code the position of the values in the array though ...
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

        // TODO Do that better
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
            scope.goNext(true, getStrength());
          }
        };
        scope.swipePrev = function () {
          if ( shouldSwipe() ) {
            scope.goPrev(true, getStrength());
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
            if ( !scope.conf.swipable ) { return; }
            $timeout(function () {
              startCoords = coords;
              lastCoords = null;
              scope.shouldAnim = false;
              scope.dragging = true;
            });
          },
          move: function ( coords ) {
            if ( !scope.conf.swipable ) { return; }
            $timeout(function () {
              lastCoords = coords;
              scope.addSwipeOffset();
              scope.shouldAnim = false;
              scope.dragging = true;
            });
          },
          end: function ( coords ) {
            if ( !scope.conf.swipable ) { return; }
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
            if ( !scope.conf.swipable ) { return; }
            scope.resetSwipe();
          }
        });
      }
    
    };
  
  })

  // KAAROUSEL SLIDING ELEMENT
  .directive('kaarouselSlider', function ( $compile ) {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element) {

        var dummy = '<kaarousel-dummy class="dummy" ng-style="getStyles()"></kaarousel-dummy>';
        
        // REGISTER ELEMENT
        scope.sliderElement = element;

        // ADD CLASSES
        angular.element(element).addClass(scope.conf.animation + '-animation');

        // ADD A DUMMY THAT LEADS THE SLIDES
        $compile(dummy)(scope, function (elt, scope) {
          angular.element(scope.sliderElement).prepend(elt);
        });
      }
    };
  })

  // KAAROUSEL SLIDE ITEM
  .directive('kaarouselSlide', function () {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, controller) {

        // Register item
        controller.addSlide(scope.slide, element);

        // Add class
        angular.element(element).addClass('kaarousel-slide');

        // Last element launch the kaarousel
        if ( scope.$last ) { controller.lastOfItems();}

        scope.itemStyles = function () {
          return {
            'width' : (100 / controller.getConf().displayed) + '%'
          };
        };

        scope.checkIndex = function ( index ) {
          return controller.getCurrentIndex() === index;
        };

        // A lot of shit just to know if a slide is visible
        // surely we can do that faster
        scope.isVisible = function ( index ) {
          var cu = controller.getCurrentIndex(),
              max = controller.getNbElements(),
              conf = controller.getConf(),
              disp = conf.displayed;

          if ( conf.centerActive ) {
            return index >= cu - Math.floor( disp / 2 ) &&
                  index <= cu + Math.floor ( disp / 2) || 
                  ( cu + 1 < disp && index < disp ) || 
                  ( cu > max - disp - 1 && index > max - disp - 1);
          } else {
            return ( index >= cu && index < cu + disp ) || ( index > max - disp - 1 && cu > max - disp - 1 );
          }
        };

        // Register images on the main controller
        // so we can update the kaarousel height later
        angular.element(element).find('img').on('load', function () {
          controller.addImage(this);
        });
      }
    };
  })

  .directive('kaarouselImage', function(){
    return {
      require: '^kaarousel',
      restrict: 'EAC',
      link: function() {
        // scope, element, attrs, controller
        // TODO add lazy loading on images        
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