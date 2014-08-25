'use strict';

angular.module('angular-kaarousel', [
    'ngTouch'
  ])

  .directive('kaarousel', function($interval, $window, $timeout) {

    return {

      restrict: 'EA',

      templateUrl: 'src/angular-kaarousel.html',

      transclude: true,

      priority: 1,

      controller: function ($scope) {

        $scope.conf = {
          shouldStopAfterUserAction: false,
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
          self.setInterval(userAction && conf.shouldStopAfterUserAction);
          return self.goTo(self.computeIndex($scope.currentIndex - 1));          
        };

        self.goNext = function ( userAction ) {
          self.setInterval(userAction && conf.shouldStopAfterUserAction);
          return self.goTo(self.computeIndex($scope.currentIndex + 1));
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
          var margin = 0;

          for ( var j = 0; j < $scope.widths.length; j++ ) {
            if ( j < index && j < max ) {
              margin += $scope.widths[j];
            }
          }

          return margin;
        };

        self.setInterval = function ( shouldStop ) {
          $interval.cancel($scope.interval);

          if ( shouldStop ) { return; }

          $scope.interval = $interval(function () {
            self.goNext();
          }, 2000);          
        };

        self.updateWidths = function () {
          for ( var j = 0; j < $scope.elements.length; j++ ) {
            $scope.widths[j] = angular.element($scope.elements[j]).outerWidth();
          }
        };

        $scope.pause = function () {
          self.setInterval( true );
        };
        $scope.resume = function () {
          self.setInterval();
        };

      },

      link: function (scope, element, attrs, controller) {

        var windowTimeout;

        scope.currentIndex = 0;
        scope.slides = [];
        scope.elements = [];

        scope.displayed = 3;
        scope.margin = 0;
        scope.widths = [];

        scope.kaarouselStyles = {
          'margin-left': '0px'
        };

        controller.setInterval();

        angular.element($window).resize(function () {
          $timeout.cancel(windowTimeout);
          windowTimeout = $timeout(function () {
            controller.updateWidths();
            controller.goTo(scope.currentIndex);
          }, 320);
        });

        console.log(scope);
      }

    };

  })

  // KAAROUSEL SLIDES WRAPPER
  .directive('kaarouselWrapper', function () {
    
    return {
    
      require: '^kaarousel',
    
      link: function (scope, element) {
        scope.wrapperElement = element;
      }
    
    };
  
  })

  // KAAROUSEL SLIDING ELEMENT
  .directive('kaarouselSlider', function () {
    
    return {

      require: '^kaarousel',
      
      link: function (scope, element) {
        scope.sliderElement = element;
      }

    };

  })

  // KAAROUSEL SLIDE ITEM
  .directive('kaarouselSlide', function () {

    return {
      
      require: '^kaarousel',
      
      scope: {
        slide: '=kaarouselSlide'
      },
      
      link: function (scope, element, attrs, controller) {
        controller.addSlide(scope.slide, element);
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
