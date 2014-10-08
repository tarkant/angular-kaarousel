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
      // {
      //   'key': 'karma',
      //   'title': 'Karma',
      //   'url': 'http://karma-runner.github.io/',
      //   'description': 'Spectacular Test Runner for JavaScript.',
      //   'logo': 'karma.png'
      // },
      // {
      //   'key': 'protractor',
      //   'title': 'Protractor',
      //   'url': 'https://github.com/angular/protractor',
      //   'description': 'End to end test framework for AngularJS applications built on top of WebDriverJS.',
      //   'logo': 'protractor.png'
      // },
      // {
      //   'key': 'jquery',
      //   'title': 'jQuery',
      //   'url': 'http://jquery.com/',
      //   'description': 'jQuery is a fast, small, and feature-rich JavaScript library.',
      //   'logo': 'jquery.jpg'
      // }
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
        $scope.sync = null;
        return;
      }
      $scope.sync++;
      $scope.sync = $scope.sync > $scope.data.length - 1 ? 0 : $scope.sync;
    }, 3000);

    $scope.displayed = 5;
    $scope.perSlide = 5;
    $scope.autoplay = false;
    $scope.pauseOnHover = true;

    $scope.shouldCenter = false;
    $scope.stopAfterAction = false;
    $scope.timeInterval = 2000;

    $scope.minWidth = 250;

    $scope.hideNav = false;
    $scope.hidePager = false;
    $scope.navOnHover = false;
    $scope.pagerOnHover = false;

    $scope.swipable = true;
    $scope.syncing = false;
    $scope.rtl = false;
    $scope.sync = $scope.syncing ? 0 : null;

    $scope.updateRate = 300;

    $scope.optionsII = {
      displayed : 1,
      loop : true,
      animation : 'shuffle',
      perSlide : 1,
      timeInterval : 1500,
      autoplay: false
    };

    $scope.afterSlide = function () {
      $scope.onslide = 'I\'ve slidded ...';
      $timeout(function () {
        $scope.onslide = null;
      }, $scope.timeInterval / 3);
    }

  });
