'use strict';

angular.module('angular-kaarousel', [
    'ngTouch'
  ])

  .directive('kaarousel', function($interval) {

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
        };

        self.computeIndex = function ( index ) {
          var nbItems = $scope.slides.length;

          if ( index >= nbItems ) { index = 0; }

          if ( index < 0 ) { index = nbItems - 1; }

          return index;
        };

        self.goPrev = function ( userAction ) {
          self.cancelInterval(userAction);
          return self.goTo(self.computeIndex($scope.currentIndex - 1));          
        };

        self.goNext = function ( userAction ) {
          self.cancelInterval(userAction);
          return self.goTo(self.computeIndex($scope.currentIndex + 1));
        };

        self.goTo = function ( index ) {
          $scope.currentIndex = index;


          var currentWidth = angular.element($scope.elements[index]).outerWidth(),
              max = $scope.elements.length - $scope.displayed;
          
          $scope.margin = $scope.margin + ( index <= max ? currentWidth : 0 );

          if ( index === 0 ) { $scope.margin = 0; }

          $scope.kaarouselStyles['margin-left'] = - $scope.margin + 'px';
          return index;
        };

        self.cancelInterval = function ( action ) {
          if ( action )  { 
            self.setInterval( conf.shouldStopAfterUserAction );
          }
        };

        self.setInterval = function ( shouldStop ) {
          $interval.cancel($scope.interval);

          if ( shouldStop ) { return; }

          $scope.interval = $interval(function () {
            self.goNext();
          }, 2000);          
        };

      },

      link: function (scope, element, attrs, controller) {

        scope.currentIndex = 0;
        scope.slides = [];
        scope.elements = [];

        scope.displayed = 3;
        scope.margin = 0;

        scope.kaarouselStyles = {
          'margin-left': '0px'
        };

        controller.setInterval();

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
          controller.cancelInterval(true);
          controller.goTo( index );
        };
      }

    };

  });
