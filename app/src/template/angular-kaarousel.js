(function(module) {
try {
  module = angular.module('angular-kaarousel');
} catch (e) {
  module = angular.module('angular-kaarousel', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('angular-kaarousel.html',
    '<div class="kaarousel-actions-wrapper" ng-mouseenter="mouseEnterCallback()" ng-mouseleave="mouseLeaveCallback()"><kaarousel-wrapper class="kaarousel-wrapper" ng-class="{shouldAnim: shouldAnim, dragging: dragging}"><kaarousel-slider ng-transclude="" class="kaarousel-slider"></kaarousel-slider></kaarousel-wrapper><kaarousel-nav ng-class="{hidden: hideNav}"><kaarousel-prev ng-click="goPrev()" class="kaarousel-prev kaarousel-nav">PREV</kaarousel-prev><kaarousel-next ng-click="goNext()" class="kaarousel-next kaarousel-nav">NEXT</kaarousel-next></kaarousel-nav><kaarousel-pager class="kaarousel-pager" ng-class="{hidden: hidePager}"><ul><li ng-repeat="i in slides track by $index" ng-click="goTo($index)" ng-class="{selected: $index === currentIndex}">{{$index}}</li></ul></kaarousel-pager></div>');
}]);
})();
