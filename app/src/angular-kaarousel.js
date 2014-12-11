'use strict';

angular.module('angular-kaarousel', [
    'ngTouch'
  ])

  /**

  * Main directive, also the main controller

  * TODO describe that better
  * TODO Add vertical sliding option
  * TODO Add lazyloading
  * TODO Loop option

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
        animation: '=',
        loop: '=',
        options: '=',
        onSlide: '&',
        minWidth: '=',
        expand: '='
      },

      controller: function ($scope) {

        var self = this, conf;

        $scope.kaarousel = $scope;

        $scope.slides = [];
        $scope.elements = [];
        $scope.sizes = [];
        $scope.isReady = false;

        // Current active index
        $scope.currentIndex = 0;
        $scope.hasStarted = false;
        // Some variables for the swipe
        $scope.swipeThreshold = 120;
        $scope.swipeStageWidth = 200;
        // Usefull to prevent animation to happen
        $scope.shouldAnim = false;
        // Stocking images when there are some
        $scope.imageCollection = [];
        $scope.loadedImage = 0;
        // To know if user has made any action
        $scope.userAction = false;
        // Current margin ( if slide animation )
        $scope.sliderMargin = 0;

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
          animation: 'slide',
          loop: false,
          onSlide: null,
          minWidth: null,
          expand: null
        };

        self.getScope = function () {
          return $scope.kaarousel;
        };

        self.getNbElements = function () {
          return $scope.elements.length;
        };

        self.computeDisplayed = function () {
          var minWidth = parseInt( $scope.minWidth, 10 ),
              confDisplayed = Math.abs(Math.ceil($scope.displayed)) || $scope.defaults.displayed,
              nbElements = self.getNbElements(),
              displayed;

          if ( minWidth && $scope.sliderElement ) {
            displayed = Math.floor( $scope.sliderElement.width() / minWidth ) || 1;
          }

          if ( !displayed || displayed > confDisplayed ) {
            displayed = confDisplayed;
          }

          if ( nbElements > displayed && displayed > confDisplayed ) {
            return confDisplayed;
          }
          if ( displayed === confDisplayed && nbElements < displayed && $scope.expand ) {
            return nbElements;
          }
          return displayed;

        };

        self.computePerSlides = function () {
          var perSlide = Math.abs(Math.ceil($scope.perSlide)) || $scope.defaults.perSlide;

          if ( $scope.animation === 'fade' || $scope.animation === 'shuffle' || perSlide > self.computeDisplayed() ) {
            perSlide = self.computeDisplayed();
          }

          return $scope.rtl ? - perSlide : perSlide;
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
            animation: $scope.animation,
            loop: $scope.loop,
            onSlide: $scope.onSlide,
            minWidth: $scope.minWidth,
            expand: $scope.expand
          };

          for ( var c in conf ) {
            if ( conf[c] === undefined ){
              delete conf[c];
            }
          }

          conf = $scope.conf = angular.extend($scope.defaults, conf, $scope.options);

          return conf;
        };

        self.getConf();

        self.addSlide = function ( element, data ) {

          $scope.elements.push(element);

          if ( data ) {
            $scope.slides.push(data);
          }

          // Save sizes
          $scope.sizes.push({
            width: angular.element(element).outerWidth(),
            height: angular.element(element).outerHeight()
          });

          // For RTL conf we should start on last slide
          if ( conf.rtl ) {
            $scope.currentIndex = self.getNbElements() - 1;
          }
        };

        self.computeIndex = function ( index ) {
          var nbItems = self.getNbElements(), out = index;
          if ( index >= nbItems ) {
            return 0;
          }
          if ( index <= - (conf.perSlide) ) {
            return nbItems - 1;
          }
          if ( index < 0 ) {
            return 0;
          }
          return out;
        };

        $scope.goPrev = function ( userAction, strength ) {
          var index = $scope.currentIndex - ( strength ? conf.displayed : parseInt(conf.perSlide, 10));
          if ( userAction && conf.stopAfterAction ) {
            $scope.userAction = true;
          }
          self.setInterval(self.shouldStop());
          return self.goTo(self.computeIndex(index), false);
        };

        $scope.goNext = function ( userAction, strength ) {
          var index = $scope.currentIndex + ( strength ? conf.displayed : parseInt(conf.perSlide, 10));
          if ( userAction && conf.stopAfterAction ) {
            $scope.userAction = true;
          }
          self.setInterval(self.shouldStop());
          return self.goTo(self.computeIndex(index), false);
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

        self.goTo = function ( index, preventCallback ) {

          var max = self.getNbElements() - conf.displayed;

          $timeout( function () {
            $scope.hasStarted = true;
            $scope.currentIndex = index;
            $scope.sliderMargin = - self.getMargin( index, max );

            if ( conf.sync || conf.sync === 0 ) {
              $scope.sync = $scope.currentIndex;
            }

            if ( !preventCallback && typeof conf.onSlide === 'function' ) {
              conf.onSlide();
            }
          });

          return index;
        };

        self.move = function ( offset ) {
          $timeout(function () {
            var max = $scope.elements.length - conf.displayed;
            $scope.sliderMargin = - ( self.getMargin( $scope.currentIndex, max ) + offset);
          });
        };

        self.getMargin = function ( index, max ) {
          var nbItems = self.getNbElements(),
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
            $scope.isCentered = true;
          } else {
            $scope.isCentered = false;
          }
          return index;
        };

        self.setInterval = function ( shouldStop ) {
          $interval.cancel($scope.interval);
          $scope.playing = false;

          if ( shouldStop || conf.sync || conf.sync === 0 ) { return; }

          $scope.interval = $interval( function () {
            $scope.playing = true;
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
          if ( $scope.currentIndex !== null ) {
            if ( conf.animation !== 'fade' && conf.animation !== 'shuffle' ) {
              styles = {
                'margin-left': $scope.sliderMargin + 'px'
              };
            } else {
              if ( $scope.isReady ) {
                styles = {
                  'height': $scope.sizes[$scope.currentIndex].height
                };
              }
            }
          }
          return styles;
        };

        self.getCurrentIndex = function () {
          return $scope.currentIndex;
        };

        self.lastItem = function () {

          // TODO if this is executed more that once it means that
          // there has been new datas added

          if ( $scope.isReady ) {
            self.updateKaarousel();
          }

          $scope.isReady = true;
          $scope.shouldAnim = true;

          if ( conf.autoplay && !$scope.playing ) {
            self.setInterval();
          }

        };

        self.updateKaarousel = function ( resetInterval ) {
          self.getConf();
          if ( resetInterval ) {
            self.setInterval( self.shouldStop() );
          }
          self.updateSizes();
          if ( $scope.hasStarted ) {
            self.goTo($scope.currentIndex, true);
          }
        };

        self.saveImage = function ( path, index, element ) {
          $scope.imageCollection.push({
            index: index,
            path: path,
            element: element
          });
          angular.element(element).on('load', function () {
            $scope.loadedImage++;
            self.updateSizes();
          });
        };

        self.updateElements = function ( element ) {
          $scope.elements.splice($scope.elements.indexOf(element), 1);
          self.updateKaarousel();
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

          $scope.wrapperElement.trigger('touchend');

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

        this.shouldHideNav = function () {
          self.getConf();
          return self.getNbElements() <= conf.displayed;
        };

        $scope.$on('$destroy', function () {
          self.setInterval(true);
        });

      },

      link: function (scope, element, attrs, controller) {

        var windowTimeout, watchTimeout, windowObj = angular.element($window),
            watchers = '[autoplay, timeInterval, displayed, perSlide, centerActive, stopAfterAction, pauseOnHover, rtl]';

        angular.element(element).addClass('kaarousel');

        // Update on window resize
        scope.$watch(function () {
          return windowObj.width();
        }, function () {
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
            for ( var i = 0; i < 2; i++ ) {
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
        scope.$watch('sync', function ( newValue, oldValue ) {

          newValue = parseInt(newValue, 10);
          oldValue = parseInt(oldValue, 10);

          // Wow ?! we should sync ? Reset interval then !
          if ( !isNaN(newValue) && isNaN(oldValue) ) {
            controller.setInterval( true );
          }

          if ( !isNaN(newValue) ) {
            if ( !scope.shouldAnim ) {
              scope.shouldAnim = true;
            }
            controller.goTo(newValue, false);
          }

          // When no longer syncing, just restart basic behaviours
          if ( isNaN(newValue) && !isNaN(oldValue) ) {
            controller.updateKaarousel( true );
          }

        });
      }
    };
  })

  .directive('kaarouselContainer', function () {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function () {}
    };
  })

  /**
  * Kaarousel Wrapper
  * Main job here is to handle swipe
  */

  .directive('kaarouselWrapper', function ( $swipe, $timeout ) {

    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, controller) {

        var startCoords, lastCoords;

        var hasEnough = function () {
          return scope.conf.swipable && controller.getNbElements() > scope.conf.displayed;
        };

        var shouldSwipe = function () {
          return startCoords && lastCoords && Math.abs( startCoords.x - lastCoords.x ) > scope.swipeThreshold;
        };

        var getStrength = function () {
          return Math.floor( Math.abs( startCoords.x - lastCoords.x ) / scope.swipeStageWidth ) + 1;
        };

        scope.kaarousel.wrapperElement = element;

        scope.addSwipeOffset = function () {
          var offset = startCoords.x - lastCoords.x;
          controller.move(offset);
        };
        scope.resetSwipe = function () {
          controller.goTo(scope.currentIndex, true);
        };

        scope.swipeHandler = $swipe.bind(element, {
          start: function ( coords ) {
            if ( !hasEnough() ) { return; }
            $timeout(function () {
              startCoords = coords;
              lastCoords = null;
            });
          },
          move: function ( coords ) {
            if ( !hasEnough() ) { return; }
            $timeout(function () {
              lastCoords = coords;
              scope.shouldAnim = false;
              scope.dragging = true;
              scope.addSwipeOffset();
            });
          },
          end: function () {
            if ( !hasEnough() || !lastCoords ) { return; }
            $timeout(function () {
              var displacement = startCoords.x - lastCoords.x;
              if ( shouldSwipe() ) {
                if ( displacement > 0 ) {
                  scope.goNext( true, getStrength() );
                } else {
                  scope.goPrev( true, getStrength() );
                }
              } else {
                scope.resetSwipe();
              }
              scope.shouldAnim = true;
              scope.dragging = false;
            });
          },
          cancel: function () {
            if ( !hasEnough() ) { return; }
            $timeout(function () {
              scope.shouldAnim = true;
              scope.dragging = false;
              scope.resetSwipe();
            });
          }
        });
      }
    };

  })

  /**
  * Directive on the moving part ot the slider
  * It's a dummy that will play the role here
  * It's added before the slides
  */

  .directive('kaarouselSlider', function ( $compile ) {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, controller) {

        var dummy = '<kaarousel-dummy class="dummy" ng-style="getStyles()"></kaarousel-dummy>',
            slider = angular.element(element);

        controller.updateKaarousel();

        // REGISTER ELEMENT
        scope.kaarousel.sliderElement = element;

        // ADD CLASSES
        slider.addClass(scope.conf.animation + '-animation');

        // ADD A DUMMY THAT LEADS THE SLIDES
        $compile(dummy)(scope, function (elt) {
          slider.prepend(elt);
        });
      }
    };
  })

  /**
  * Directive on each slides
  * It does the job of checking if the slide
  * is the current one or if it's visible
  * also apply styles ( width of the item )
  */

  .directive('kaarouselSlide', function () {
    return {
      restrict: 'EA',
      require: '^kaarousel',
      link: function (scope, element, attrs, controller) {

        var parentScope = controller.getScope(), repeatRule;

        // Register item
        if ( attrs.ngRepeat ) {
          repeatRule = attrs.ngRepeat.split(' ')[0];
        }

        controller.addSlide(element, repeatRule ? scope[repeatRule] : null);

        // Add class
        angular.element(element).addClass('kaarousel-slide');

        // Last element launch the kaarousel
        if ( scope.$last ) {
          controller.lastItem();
        }

        scope.$on('$destroy', function () {
          controller.updateElements(element);
        });

        scope.itemStyles = function () {

          var conf = controller.getConf(),
              modulo = scope.$index % conf.displayed,
              itemWidth = 100 / conf.displayed;

          var styles = {
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

        scope.isActive = function () {
          return parentScope.currentIndex === scope.$index;
        };

        // A lot of shit just to know if a slide is visible
        // surely we can do that faster
        scope.isVisible = function () {
          var index = scope.$index,
              cu = parentScope.currentIndex,
              max = controller.getNbElements(),
              disp = controller.getConf().displayed;

          if ( parentScope.conf.centerActive && parentScope.isCentered ) {
            return index >= cu - Math.floor( disp / 2 ) &&
                   index <= cu + Math.floor( disp / 2 ) ||
                   ( cu + 1 < disp && index < disp ) ||
                   ( cu > max - disp - 1 && index > max - disp - 1);
          } else {
            return ( index >= cu && index < cu + disp ) ||
                   ( index > max - disp - 1 && cu > max - disp - 1 );
          }
        };
      }
    };
  })

  .directive('kaarouselImage', function(){
    return {
      require: '^kaarousel',
      restrict: 'EAC',
      link: function(scope, element, attrs, controller) {
        // TODO add lazy loading on images
        controller.saveImage(attrs.ngSrc, scope.$index, element);
      }
    };
  })

  .directive('kaarouselNav', function(){
    return {
      require: '^kaarousel',
      restrict: 'EA',
      link: function(scope, element, attrs, controller) {

        scope.$watch(function () {
          return controller.getNbElements();
        }, function () {
          scope.shouldHideNav = controller.shouldHideNav();
        });

        scope.$watch('displayed', function () {
          scope.shouldHideNav = controller.shouldHideNav();
        });

      }
    };
  })

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
          controller.goTo( index, false );
        };
      }
    };
  });