'use strict';

angular.module('angular-kaarousel')
  .service('KaarouselFactory', function ($interval) {
    
    var KaarouselFactory = function () {
      var self = this;

      self.settings = {};

      self.activeIndex = 0;

      self.sliderDomElement = null;

      self.slides = [];
      self.elements = [];
      self.sizes = [];
    };

    KaarouselFactory.prototype.defaultSettings = {
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

      var self = this;

      var lookFor = [
        'displayed',
        'perSlide',
        'autoplay',
        'pauseOnHover',
        'centerActive',
        'timeInterval',
        'stopAfterAction',
        'hideNav',
        'hidePager',
        'navOnHover',
        'pagerOnHover',
        'swipable',
        'sync',
        'animation',
        'loop',
        'minWidth',
        'expand'
      ], options = {};

      for (var i = lookFor.length - 1; i >= 0; i--) {
        if ( lookFor[i] in attrs ) {
          if ( scope[lookFor[i]] !== undefined ) {
            options[lookFor[i]] = scope[lookFor[i]];
          }
        }
      }

      if ( scope.options ) {
        options = angular.extend(scope.options, options);
      }

      options = angular.extend(angular.copy(this.defaultSettings), options);

      options.displayed = self.computeDisplayed(options);

      this.settings = options;

      return options;

    };

    KaarouselFactory.prototype.computeDisplayed = function ( conf ) {

      var minWidth = parseInt( conf.minWidth, 10 ),
          conf = Math.abs(Math.ceil(conf.displayed)), out;

      if ( minWidth && this.sliderDomElement ) {
        out = Math.floor( this.sliderDomElement.width() / minWidth ) || 1;
      }

      if ( !out || out > conf ) {
        out = conf;
      }

      if ( this.elements.length > out && out > conf ) {
        return conf;
      }
      if ( out === conf && this.elements.length < out && conf.expand ) {
        return this.elements.length;
      }
      return out;
    };

    KaarouselFactory.prototype.getNumberOf = function( what ) {
      return self[what].length || null;
    };

    KaarouselFactory.prototype.computeIndex = function(index) {
      var self = this;
      if ( index >= self.elements.length ) {
        return 0;
      }
      if ( index <= - (self.settings.perSlide) ) {
        return self.elements.length - 1;
      }
      if ( index < 0 ) {
        return 0;
      }
      return index;
    }

    KaarouselFactory.prototype.move = function( where, index ) {
      var self = this;
      switch ( where ) {
        case 'next':
          self.activeIndex = self.computeIndex(self.activeIndex + self.settings.perSlide);
          break;
        case 'prev':
          self.activeIndex = self.computeIndex(self.activeIndex - self.settings.perSlide);
          break;
        default:
          self.activeIndex = index;
          break;
      }
    };

    return KaarouselFactory;

  });
