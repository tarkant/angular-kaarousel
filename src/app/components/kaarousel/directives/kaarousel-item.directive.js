(function() {

    'use strict';

    angular
        .module('angular-kaarousel')
        .directive('kaarouselSlide', kaarouselSlide);

    /** @ngInject */
    function kaarouselSlide() {
        var directive = {
            restrict: 'EA',
            require: '^kaarousel',
            link: linkFn
        };

        return directive;

        function linkFn(scope, element, attrs, ctrl) {

            ctrl.register(element, scope.$index);

            if (scope.$last && !ctrl.ready) {
                ctrl.init();
            }

            scope.$on('$destroy', function() {
                ctrl.removeSlide(scope.$index);
            });
        }
    }

})();
