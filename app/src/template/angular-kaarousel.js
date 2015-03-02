(function(module) {
try {
  module = angular.module('angular-kaarousel');
} catch (e) {
  module = angular.module('angular-kaarousel', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/angular-kaarousel.html',
    '<kaarousel-container class="kaarousel-actions-wrapper"><kaarousel-wrapper class="kaarousel-wrapper" ng-class="{anim: shouldAnim, dragging: dragging}"><kaarousel-slider ng-transclude="" class="kaarousel-slider"></kaarousel-slider></kaarousel-wrapper><kaarousel-nav class="kaarousel-nav" ng-class="{\'is-hidden\': shouldHideNav()}"><kaarousel-prev ng-click="move(\'prev\')" ng-class="{\'is-hidden\': shouldHidePrev()}" class="kaarousel-prev">PREV</kaarousel-prev><kaarousel-next ng-click="move(\'next\')" ng-class="{\'is-hidden\': shouldHideNext()}" class="kaarousel-next">NEXT</kaarousel-next></kaarousel-nav><kaarousel-pager class="kaarousel-pager" ng-class="{\'is-hidden\': shouldHidePager()}"><ul><li ng-repeat="i in factory.elements track by $index" ng-click="move($index)" ng-class="{selected: $index === factory.activeIndex}">{{$index}}</li></ul></kaarousel-pager></kaarousel-container>');
}]);
})();
