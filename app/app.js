'use strict';

angular.module('myApp', [
    'angular-kaarousel'
  ])
  .controller('MainCtrl', function ($scope, $interval, $timeout) {
    $scope.data = [
      {
        'key': 'angular',
        'title': 'AngularJS',
        'url': 'https://angularjs.org/',
        'description': 'HTML enhanced for web apps!',
        'logo': 'angular.png'
      },
      {
        'key': 'browsersync',
        'title': 'BrowserSync',
        'url': 'http://browsersync.io/',
        'description': 'Time-saving synchronised browser testing.',
        'logo': 'browsersync.png'
      },
      {
        'key': 'gulp',
        'title': 'GulpJS',
        'url': 'http://gulpjs.com/',
        'description': 'The streaming build system.',
        'logo': 'gulp.png'
      },
      {
        'key': 'jasmine',
        'title': 'Jasmine',
        'url': 'http://jasmine.github.io/',
        'description': 'Behavior-Driven JavaScript.',
        'logo': 'jasmine.png'
      },
      {
        'key': 'karma',
        'title': 'Karma',
        'url': 'http://karma-runner.github.io/',
        'description': 'Spectacular Test Runner for JavaScript.',
        'logo': 'karma.png'
      },
      {
        'key': 'protractor',
        'title': 'Protractor',
        'url': 'https://github.com/angular/protractor',
        'description': 'End to end test framework for AngularJS applications built on top of WebDriverJS.',
        'logo': 'protractor.png'
      },
      {
        'key': 'jquery',
        'title': 'jQuery',
        'url': 'http://jquery.com/',
        'description': 'jQuery is a fast, small, and feature-rich JavaScript library.',
        'logo': 'jquery.jpg'
      }
    ];

    $scope.data2 = [
      {
        'key': 'angular',
        'title': 'AngularJS LOOOOL',
        'url': 'https://angularjs.org/',
        'description': 'HTML enhanced for web apps!',
        'logo': 'angular.png'
      },
      {
        'key': 'browsersync',
        'title': 'BrowserSync',
        'url': 'http://browsersync.io/',
        'description': 'Time-saving synchronised browser testing.',
        'logo': 'browsersync.png'
      },
      {
        'key': 'gulp',
        'title': 'GulpJS',
        'url': 'http://gulpjs.com/',
        'description': 'The streaming build system.',
        'logo': 'gulp.png'
      },
      {
        'key': 'jasmine',
        'title': 'Jasmine',
        'url': 'http://jasmine.github.io/',
        'description': 'Behavior-Driven JavaScript.',
        'logo': 'jasmine.png'
      },
      {
        'key': 'karma',
        'title': 'Karma',
        'url': 'http://karma-runner.github.io/',
        'description': 'Spectacular Test Runner for JavaScript.',
        'logo': 'karma.png'
      },
      {
        'key': 'protractor',
        'title': 'Protractor',
        'url': 'https://github.com/angular/protractor',
        'description': 'End to end test framework for AngularJS applications built on top of WebDriverJS.',
        'logo': 'protractor.png'
      },
      {
        'key': 'jquery',
        'title': 'jQuery',
        'url': 'http://jquery.com/',
        'description': 'jQuery is a fast, small, and feature-rich JavaScript library.',
        'logo': 'jquery.jpg'
      }
    ];

    $scope.images = [
      {
        url : 'http://lorempicsum.com/futurama/627/300/4'
      },
      {
        url : 'http://lorempicsum.com/futurama/627/300/3'
      },
      {
        url : 'http://lorempicsum.com/futurama/627/300/2'
      },
      {
        url : 'http://lorempicsum.com/futurama/255/200/5'
      },
      {
        url : 'http://lorempicsum.com/futurama/350/200/6'
      },
      {
        url : 'http://lorempicsum.com/futurama/627/300/8'
      },
      {
        url : 'http://lorempicsum.com/futurama/627/300/7'
      },
      {
        url : 'http://lorempicsum.com/futurama/627/300/6'
      },
      {
        url : 'http://lorempicsum.com/futurama/627/300/5'
      },
      {
        url : 'http://lorempicsum.com/futurama/627/300/9'
      },
      {
        url : 'http://lorempicsum.com/futurama/627/300/7'
      },
      {
        url : 'http://lorempicsum.com/futurama/627/300/2'
      },
      {
        url : 'http://lorempicsum.com/futurama/627/300/1'
      },
      {
        url : 'http://lorempicsum.com/futurama/627/300/8'
      },
    ];

    $interval(function () {
      if ( !$scope.syncing ) {
        $scope.options.sync = null;
        return;
      }
      $scope.options.sync++;
      $scope.options.sync = $scope.options.sync > $scope.data.length - 1 ? 0 : $scope.options.sync;
    }, 1000);

    $scope.syncing = false;

    $scope.options = {

      displayed : 5,
      perSlide : 3,
      autoplay : true,
      pauseOnHover : true,

      centerActive : false,
      stopAfterAction : false,
      timeInterval : 3500,
      transitionDuration: 700,

      hideNav : false,
      hidePager : false,
      navOnHover : false,
      pagerOnHover : false,
      sync : null,

      swipable : true,
      updateRate : 300,
      minWidth : 300,
      expand : true,
      loop: true

    };

    $scope.options2 = {

      displayed : 3,
      perSlide : 3,
      autoplay : true,
      pauseOnHover : false,

      centerActive : false,
      stopAfterAction : false,
      timeInterval : 5000,

      hideNav : false,
      hidePager : true,
      navOnHover : false,
      pagerOnHover : true,

      swipable : false,
      syncing : false,
      updateRate : 500

    };

    $scope.sync = $scope.options.syncing ? 0 : null;

    $scope.get = function  (nb) {
      var tb = [];
      for (var i = 0; i < nb; i++) {
        tb.push(i);
      };
      return tb;
    }

  });
