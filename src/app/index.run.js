(function() {
    'use strict';

    angular
        .module('angularKaarousel')
        .run(runBlock);

    /** @ngInject */
    function runBlock($log) {
        $log.debug('runBlock end');
    }

})();
