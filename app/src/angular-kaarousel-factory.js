'use strict';

angular.module('angular-kaarousel')
  .service('KaarouselFactory', function ($interval, $timeout) {

    var _pi = function( value ) {
      return parseInt(value, 10);
    };
    
    var KaarouselFactory = function () {
      var self = this;

      self.settings = {};

      self.activeIndex = 0;
      self.interval = 0;

      self.sliderDomElement = null;

      self.slides = [];
      self.elements = [];
      self.sizes = [];

      self.isReady = false;
      self.hasStarted = false;
      self.userAction = null;
      self.pausedByUser = null;

      self.isEnabled = true;
    };

    KaarouselFactory.prototype.defaultSettings = {
      displayed: 3,
      perSlide: 1,
      autoplay: true,
      pauseOnHover: true,
      centerActive: false,
      timeInterval: 3000,
      transitionDuration: 500,
      stopAfterAction: false,
      hideNav: false,
      hidePager: false,
      navOnHover: false,
      pagerOnHover: false,
      isSwipable: true,
      sync: false,
      animation: 'slide',
      loop: true,
      afterSlide: null,
      beforeSlide: null,
      minWidth: null,
      expand: true,
      updateRate: 100
    };

    KaarouselFactory.prototype.set = function ( what, value ) {
      this[what] = value;
    };

    KaarouselFactory.prototype.get = function ( what ) {
      return this[what] !== undefined ? this[what] : null;
    };

    KaarouselFactory.prototype.makeConf = function ( attrs, scope ) {

      var lookFor = [
        'displayed',
        'perSlide',
        'autoplay',
        'pauseOnHover',
        'centerActive',
        'timeInterval',
        'transitionDuration',
        'stopAfterAction',
        'hideNav',
        'hidePager',
        'navOnHover',
        'pagerOnHover',
        'isSwipable',
        'sync',
        'animation',
        'loop',
        'minWidth',
        'afterSlide',
        'beforeSlide',
        'expand'
      ], options = {};

      var parse = [
        'displayed',
        'perSlide',
        'minWidth',
        'timeInterval',
        'transitionDuration'
      ];

      for (var i = lookFor.length - 1; i >= 0; i--) {
        if ( lookFor[i] in attrs ) {
          if ( scope[lookFor[i]] !== undefined ) {
            options[lookFor[i]] = lookFor[i] in parse ? _pi(scope[lookFor[i]]) : scope[lookFor[i]];
          }
        }
      }

      if ( scope.options ) {
        options = angular.extend(scope.options, options);
      }

      options = angular.extend(angular.copy(this.defaultSettings), options);

      options.displayed = this.computeDisplayed(options);
      options.perSlide = this.computePerSlides(options);

      this.settings = options;

      this.shouldHideNav = !this.canSlide() ? true : this.settings.hideNav;
      this.shouldHidePager = !this.canSlide() ? true : this.settings.hidePager;

      return options;

    };

    KaarouselFactory.prototype.computeDisplayed = function ( conf ) {

      var minWidth = _pi(conf.minWidth || 0),
          confDisp = Math.abs(Math.ceil(conf.displayed)), out;

      if ( minWidth > 0 && this.sliderDomElement ) {
        out = Math.floor( this.sliderDomElement.outerWidth() / minWidth ) || confDisp;
      }

      if ( !out || out > confDisp ) {
        out = confDisp;
      }

      if ( this.elements.length > out && out > confDisp ) {
        return confDisp;
      }

      if ( out === confDisp && this.elements.length < out && conf.expand ) {
        return this.elements.length;
      }

      return out;
    };

    KaarouselFactory.prototype.computePerSlides = function ( conf ) {
      var out = Math.abs(Math.ceil(conf.perSlide)) || 1,
          ref = conf.displayed;

      if ( conf.animation !== 'slide' || out > ref ) {
        out = ref;
      }

      return out;
    };

    KaarouselFactory.prototype.computeIndex = function(index, direction, strength) {
      var self = this;
      var nextIndex = index + (direction === 'next' ? self.settings.perSlide : - self.settings.perSlide);
      
      this.stoppedAtEnd = false;

      if ( nextIndex >= self.elements.length ) {
        if ( self.settings.loop ) {
          return 0;
        } else {
          this.stoppedAtEnd = true;
          return index;
        }
      }
      if ( nextIndex <= - (self.settings.perSlide) ) {
        if ( self.settings.loop ) {
          return self.elements.length - 1;
        } else {
          this.stoppedAtEnd = true;
          return index;
        }
      }
      if ( nextIndex < 0 ) {
        return 0;
      }
      return nextIndex;
    };

    KaarouselFactory.prototype.hideNavs = function() {
      this.shouldHideNext = false;
      this.shouldHidePrev = false;
      if ( this.settings.loop ) { return; }
      this.shouldHideNext = this.activeIndex >= this.elements.length - this.settings.displayed;
      this.shouldHidePrev = this.activeIndex < this.settings.perSlide;
    };

    KaarouselFactory.prototype.move = function( where, isUserAction, preventCallback, strength ) {
      var self = this, currentslideindex = self.activeIndex;

      self.hasStarted = true;


      // Set userAction to true if needed
      if ( isUserAction && this.settings.stopAfterAction ) {
        this.userAction = true;
      }
      
      switch ( where ) {
        case 'next':
        case 'prev':
          self.activeIndex = self.computeIndex(self.activeIndex, where, strength);
          break;
        default:
          self.activeIndex = _pi(where);
          break;
      }

      // Reset The Interval
      this.setInterval(this.shouldStop());

      this.hideNavs();
      this.sliderMargin = - self.getMargin();

      if ( currentslideindex === self.activeIndex ) { return; }

      // Call Callback Functions
      if ( !preventCallback && self.settings.beforeSlide ) {
        if ( typeof self.scope.$parent[self.settings.beforeSlide] === 'function' ) {
          self.scope.$parent[self.settings.beforeSlide](currentslideindex, self.activeIndex);
        }
      }
      
      if ( !preventCallback && self.settings.afterSlide ) {
        $timeout(function () {
          if ( typeof self.scope.$parent[self.settings.afterSlide] === 'function' ) {
            self.scope.$parent[self.settings.afterSlide](self.activeIndex);
          }
        }, self.settings.transitionDuration);
      }
    };

    KaarouselFactory.prototype.getStyles = function() {

      this.updateSizes();

      var styles = {};
      if ( this.activeIndex !== null ) {
        if ( this.settings.animation === 'slide' ) {
          styles = {
            'margin-left': this.sliderMargin || 0 + 'px'
          };
        } else {
          if ( this.isReady ) {
            styles = {
              'height': this.sizes[this.activeIndex].height
            };
          }
        }
      }
      styles['transition-duration'] = this.settings.transitionDuration / 1000 + 's';
      return styles;
    };

    KaarouselFactory.prototype.setInterval = function( stopping ) {
      var self = this;

      $interval.cancel(self.interval);

      if ( stopping ) {
        self.playing = false;
      }

      self.hideNavs();

      if ( stopping || self.settings.sync || self.settings.sync === 0 ) { return; }

      self.interval = $interval( function () {
        self.stoppedAtEnd = false;
        self.playing = true;
        self.move('next');
      }, self.settings.timeInterval);
    };

    KaarouselFactory.prototype.shouldStop = function() {
      if ( this.settings.autoplay ) {
        if ( (this.userAction && this.settings.stopAfterAction) || this.pausedByUser || this.stoppedAtEnd || !this.canSlide()) {
          return true;
        }
        return false;
      }
      return true;
    };

    KaarouselFactory.prototype.updateSizes = function () {
      for ( var j = 0; j < this.elements.length; j++ ) {
        var elt = angular.element(this.elements[j]);
        this.sizes[j] = {
          width : elt.outerWidth(),
          height : elt.outerHeight()
        };
      }
    };

    KaarouselFactory.prototype.update = function( reset ) {
      var self = this;
      if ( reset ) {
        this.setInterval( this.shouldStop() );
      }
      this.bindEvents();
      if ( this.hasStarted ) {
        $timeout(function () {
          self.move(self.activeIndex, false, true);          
        }, 100);
      }
    };

    KaarouselFactory.prototype.getMargin = function () {
      var margin = 0;
      for ( var j = 0; j < this.elements.length; j++ ) {
        if ( j < this.loopUntil(this.activeIndex) && j < this.elements.length - this.settings.displayed ) {
          margin += this.sizes[j].width;
        }
      }
      return margin;
    };

    KaarouselFactory.prototype.loopUntil = function ( index ) {
      this.isCentered = false;
      if ( this.settings.centerActive && ( this.settings.displayed & 1) ) {
        index = index - Math.floor( this.settings.displayed / 2 );
        this.isCentered = true;
      }
      return index;
    };

    KaarouselFactory.prototype.shift = function ( offset ) {
      this.sliderMargin = - ( this.getMargin() + offset );
    };

    KaarouselFactory.prototype.removeSlide = function( element ) {
      this.elements.splice(this.elements.indexOf(element), 1);
      this.update();
    };

    KaarouselFactory.prototype.pause = function() {
      this.pausedByUser = true;
      this.setInterval(true);
    };

    KaarouselFactory.prototype.resume = function() {
      if ( this.stoppedAtEnd ) { return; }
      this.pausedByUser = false;
      this.setInterval(this.shouldStop());
    };

    KaarouselFactory.prototype.mouseEnterCallback = function () {
      if ( this.settings.pauseOnHover ) {
        this.pause();
      }
      if ( this.settings.navOnHover ) {
        this.shouldHideNav = false;
      }
      if ( this.settings.pagerOnHover ) {
        this.shouldHidePager = false;
      }
    };

    KaarouselFactory.prototype.mouseLeaveCallback = function () {

      this.wrapperDomElement.trigger('touchend');

      if ( !this.settings.stopAfterHover && this.settings.pauseOnHover ) {
        this.resume();
      }
      if ( this.settings.navOnHover && this.settings.hideNav ) {
        this.shouldHideNav = true;
      }
      if ( this.settings.pagerOnHover && this.settings.hidePager ) {
        this.shouldHidePager = true;
      }
    };

    KaarouselFactory.prototype.changeState = function( state ) {
      if ( state ) { 
        if ( !this.isEnabled ) {
          if ( this.lastActiveIndex ) {
            this.activeIndex = this.lastActiveIndex;
          }
          this.shouldHideNav = this.settings.hideNav;
          this.shouldHidePager = this.settings.hidePager;
          this.isEnabled = true;
        }
      } else {
        if ( this.isEnabled ) {
          if ( this.activeIndex ) {
            this.lastActiveIndex = this.activeIndex;
            this.activeIndex = null;
          }

          this.shouldHideNav = true;
          this.shouldHidePager = true;

          this.isEnabled = false;
        }
      }
    };

    KaarouselFactory.prototype.canSlide = function() {
      var conf = this.settings, canPlay = this.elements.length > conf.displayed || conf.perSlide < conf.displayed;
      this.changeState( canPlay );
      return canPlay;
    };

    KaarouselFactory.prototype.computeHideNav = function() {
      return this.shouldHideNav || !this.canSlide();
    };

    KaarouselFactory.prototype.bindEvents = function( remove ) {
      
      var self = this;

      var needEvents = this.settings.pauseOnHover || this.settings.pagerOnHover || this.settings.navOnHover;

      if ( remove || !needEvents ) {
        this.wrapperDomElement.unbind();
        this.binded = false;
      }

      if ( !remove && needEvents && !this.binded ) {
        this.binded = true;
        this.wrapperDomElement.bind({
          mouseenter: function () {
            self.mouseEnterCallback();
          },
          mouseleave: function () {
            self.mouseLeaveCallback();
          }
        });
      }
    };

    return KaarouselFactory;

  });
