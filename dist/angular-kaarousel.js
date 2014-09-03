"use strict";angular.module("angular-kaarousel",["ngTouch"]).directive("kaarousel",["$interval","$window","$timeout",function(e,n,t){return{restrict:"EA",templateUrl:"src/angular-kaarousel.html",transclude:!0,scope:{displayed:"=",perSlide:"=",autoplay:"=",pauseOnHover:"=",centerActive:"=",timeInterval:"=",updateRate:"=",stopAfterAction:"=",hideNav:"=",hidePager:"=",navOnHover:"=",pagerOnHover:"=",swipable:"=kaaSwipable",sync:"=",rtl:"=",data:"=",animation:"=",loop:"=",options:"="},controller:["$scope",function(n){var r,i=this;n.slides=[],n.elements=[],n.sizes=[],n.currentIndex=0,n.swipeThreshold=120,n.swipeStageWidth=200,n.shouldAnim=!1,n.imageCollection=[],n.loadedImage=0,n.userAction=!1,n.sliderMargin=0,n.defaults={displayed:3,perSlide:1,autoplay:!0,pauseOnHover:!0,centerActive:!1,timeInterval:3e3,stopAfterAction:!1,hideNav:!1,hidePager:!1,navOnHover:!1,pagerOnHover:!1,swipable:!0,sync:!1,rtl:!1,animation:"slide",loop:!1},i.getConf=function(){r={displayed:i.computeDisplayed(),perSlide:i.computePerSlides(),autoplay:n.autoplay,pauseOnHover:n.pauseOnHover,centerActive:n.centerActive,timeInterval:n.timeInterval,stopAfterAction:n.stopAfterAction,hideNav:n.hideNav,hidePager:n.hidePager,navOnHover:n.navOnHover,pagerOnHover:n.pagerOnHover,swipable:n.swipable,sync:n.sync,rtl:n.rtl,animation:n.animation,loop:n.loop};for(var e in r)void 0===r[e]&&delete r[e];return r=n.conf=angular.extend(n.defaults,r,n.options)},i.computeDisplayed=function(){var e=Math.abs(Math.ceil(n.displayed))||n.defaults.displayed;return e>n.slides.length?n.slides.length:e},i.computePerSlides=function(){var e=Math.abs(Math.ceil(n.perSlide))||n.defaults.perSlide;return n.rtl?-e:e},r=i.getConf(),i.addSlide=function(e,t){n.slides.push(e),n.elements.push(t),n.sizes.push({width:angular.element(t).outerWidth(),height:angular.element(t).outerHeight()}),r.rtl&&(n.currentIndex=n.slides.length-1)},i.computeIndex=function(e){var t=n.slides.length;return e>=t&&(e=0),0>e&&(e=t-1),e},n.goPrev=function(e,t){var a=n.currentIndex-(t?r.displayed:parseInt(r.perSlide,10));return e&&r.stopAfterAction&&(n.userAction=!0),i.setInterval(i.shouldStop()),i.goTo(i.computeIndex(a))},n.goNext=function(e,t){var a=n.currentIndex+(t?r.displayed:parseInt(r.perSlide,10));return e&&r.stopAfterAction&&(n.userAction=!0),i.setInterval(i.shouldStop()),i.goTo(i.computeIndex(a))},i.shouldStop=function(){return r.autoplay?n.userAction&&r.stopAfterAction||n.pausedByUser?!0:!1:!0},i.goTo=function(e){var a=n.slides.length-r.displayed;return t(function(){n.currentIndex=e,n.sliderMargin=-i.getMargin(e,a)}),e},i.move=function(e){t(function(){var t=n.elements.length-r.displayed;n.sliderMargin=-(i.getMargin(n.currentIndex,t)+e)})},i.getMargin=function(e,t){var a,o=n.slides.length,l=i.getWatchUntil(e),s=0;if(r.rtl){for(var u=0;o>u;u++)s+=n.sizes[u].width;for(a=o;a>0;a--)o-l>o-a-2&&(s-=n.sizes[a-1].width)}else for(a=0;o>a;a++)l>a&&t>a&&(s+=n.sizes[a].width);return s},i.getWatchUntil=function(e){return r.centerActive&&1&r.displayed?(e-=Math.floor(r.displayed/2),n.isCentered=!0):n.isCentered=!1,e},i.setInterval=function(t){e.cancel(n.interval),n.playing=!1,t||r.sync||0===r.sync||(n.interval=e(function(){n.playing=!0,n.goNext()},r.timeInterval))},i.updateSizes=function(){for(var e=0;e<n.elements.length;e++)n.sizes[e]={width:angular.element(n.elements[e]).outerWidth(),height:angular.element(n.elements[e]).outerHeight()}},n.getStyles=function(){var e={};return null!==n.currentIndex&&("fade"!==r.animation?e={"margin-left":n.sliderMargin+"px"}:n.isReady&&(e={height:n.sizes[n.currentIndex].height})),e},i.getCurrentIndex=function(){return n.currentIndex},i.lastItem=function(){i.goTo(i.getCurrentIndex()),n.isReady=!0,n.shouldAnim=!0,r.autoplay&&!n.playing&&i.setInterval()},i.updateKaarousel=function(e){i.getConf(),e&&i.setInterval(i.shouldStop()),i.updateSizes(),i.goTo(n.currentIndex)},i.getNbElements=function(){return n.slides.length},i.saveImage=function(e,t,r){n.imageCollection.push({index:t,path:e,element:r}),angular.element(r).on("load",function(){n.loadedImage++,i.updateSizes()})},n.pause=function(){n.pausedByUser=!0,i.setInterval(!0)},n.resume=function(){n.pausedByUser=!1,i.setInterval(i.shouldStop())},n.mouseEnterCallback=function(){r.pauseOnHover&&n.pause(),r.navOnHover&&(n.hideNav=!1),r.pagerOnHover&&(n.hidePager=!1)},n.mouseLeaveCallback=function(){!r.stopAfterHover&&r.pauseOnHover&&n.resume(),r.navOnHover&&(n.hideNav=!0),r.pagerOnHover&&(n.hidePager=!0)},this.shouldHideNav=function(){return n.slides.length<2}}],link:function(e,r,i,a){var o,l,s=angular.element(n),u="[autoplay, timeInterval, sync, displayed, perSlide, centerActive, stopAfterAction, pauseOnHover, rtl]";angular.element(r).addClass("kaarousel"),e.$$nextSibling.kaarousel=e,e.$watch(function(){return s.width()},function(){t.cancel(o),o=t(function(){a.updateKaarousel(!0)},e.updateRate||500)}),e.$watchCollection(u,function(n,r){t.cancel(l),l=t(function(){for(var e,t=0;3>t;t++)if(n[t]!==r[t]){e=!0;break}a.updateKaarousel(e)},e.updateRate)}),e.$watch("sync",function(){isNaN(e.sync)||(e.shouldAnim=!0,e.pausedByUser||a.goTo(e.sync))})}}}]).directive("kaarouselWrapper",["$swipe","$timeout",function(e,n){return{restrict:"EA",require:"^kaarousel",link:function(t,r,i,a){var o,l,s=function(){return o&&l&&Math.abs(o.x-l.x)>t.swipeThreshold},u=function(){return Math.floor(Math.abs(o.x-l.x)/t.swipeStageWidth)+1};t.wrapperElement=r,t.addSwipeOffset=function(){var e=o.x-l.x;a.move(e)},t.resetSwipe=function(){a.goTo(t.currentIndex)},t.swipeHandler=e.bind(r,{start:function(e){t.conf.swipable&&n(function(){o=e,l=null,t.shouldAnim=!1,t.dragging=!0})},move:function(e){t.conf.swipable&&n(function(){l=e,t.addSwipeOffset()})},end:function(e){t.conf.swipable&&n(function(){l=e;var n=o.x-l.x;s()?n>0?t.goNext(!0,u()):t.goPrev(!0,u()):t.resetSwipe(),t.shouldAnim=!0,t.dragging=!1})},cancel:function(){t.conf.swipable&&t.resetSwipe()}})}}}]).directive("kaarouselSlider",["$compile",function(e){return{restrict:"EA",require:"^kaarousel",link:function(n,t){var r='<kaarousel-dummy class="dummy" ng-style="getStyles()"></kaarousel-dummy>',i=angular.element(t);n.sliderElement=t,i.addClass(n.conf.animation+"-animation"),e(r)(n,function(e){i.prepend(e)})}}}]).directive("kaarouselSlide",function(){return{restrict:"EA",require:"^kaarousel",link:function(e,n,t,r){var i=e.kaarousel,a=t.ngRepeat.split(" ")[0];r.addSlide(e[a],n),angular.element(n).addClass("kaarousel-slide"),e.$last&&r.lastItem(),e.itemStyles=function(){return{width:100/r.getConf().displayed+"%"}},e.isActive=function(){return i.currentIndex===e.$index},e.isVisible=function(){var n=e.$index,t=i.currentIndex,a=i.slides.length,o=r.getConf().displayed;return i.conf.centerActive&&i.isCentered?n>=t-Math.floor(o/2)&&n<=t+Math.floor(o/2)||o>t+1&&o>n||t>a-o-1&&n>a-o-1:n>=t&&t+o>n||n>a-o-1&&t>a-o-1}}}}).directive("kaarouselImage",function(){return{require:"^kaarousel",restrict:"EAC",link:function(e,n,t,r){r.saveImage(t.ngSrc,e.$index,n)}}}).directive("kaarouselNav",function(){return{require:"^kaarousel",restrict:"EA",link:function(e,n,t,r){e.$watch(function(){return r.getNbElements()},function(){e.shouldHideNav=r.shouldHideNav()})}}}).directive("kaarouselPager",function(){return{restrict:"EA",require:"^kaarousel",link:function(e,n,t,r){e.goTo=function(n){e.stopAfterAction&&(e.userAction=!0),r.setInterval(r.shouldStop()),r.goTo(n)}}}});
!function(a){try{a=angular.module("angular-kaarousel")}catch(e){a=angular.module("angular-kaarousel",[])}a.run(["$templateCache",function(a){a.put("src/angular-kaarousel.html",'<div class="kaarousel-actions-wrapper" ng-mouseenter="mouseEnterCallback()" ng-mouseleave="mouseLeaveCallback()"><kaarousel-wrapper class="kaarousel-wrapper" ng-class="{shouldAnim: shouldAnim, dragging: dragging}"><kaarousel-slider ng-transclude="" class="kaarousel-slider"></kaarousel-slider></kaarousel-wrapper><kaarousel-nav ng-class="{hidden: hideNav}"><kaarousel-prev ng-click="goPrev()" ng-if="!shouldHideNav" class="kaarousel-prev kaarousel-nav">PREV</kaarousel-prev><kaarousel-next ng-click="goNext()" ng-if="!shouldHideNav" class="kaarousel-next kaarousel-nav">NEXT</kaarousel-next></kaarousel-nav><kaarousel-pager class="kaarousel-pager" ng-class="{hidden: hidePager}"><ul><li ng-repeat="i in slides track by $index" ng-click="goTo($index)" ng-class="{selected: $index === currentIndex}">{{$index}}</li></ul></kaarousel-pager></div>')}])}();