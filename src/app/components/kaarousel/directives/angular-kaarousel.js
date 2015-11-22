(function() {

    'use strict';

    angular
        .module('angular-kaarousel', ['ngTouch'])
        .directive('kaarousel', kaarousel);

    /** @ngInject */
    function kaarousel() {
        var directive = {
            restrict: 'EA',
            scope: {
                displayed: '=?',
                perSlide: '=?',
                autoplay: '=?',
                direction: '=?',
                pauseOnHover: '=?',
                centerActive: '=?',
                timeInterval: '=?',
                transitionDuration: '=?',
                updateRate: '=?',
                stopAfterAction: '=?',
                hideNav: '=?',
                hidePager: '=?',
                navOnHover: '=?',
                pagerOnHover: '=?',
                swipable: '=?',
                sync: '=?',
                data: '=?',
                animation: '=?',
                loop: '=?',
                options: '=?',
                afterSlide: '&?',
                beforeSlide: '&?',
                minWidth: '=?',
                expand: '=?'
            },
            templateUrl: 'app/components/kaarousel/templates/angular-kaarousel.html',
            transclude: true,
            controller: KaarouselController,
            controllerAs: 'kc'
        };

        return directive;
    }

    /** @ngInject */
    function KaarouselController($scope, $element, $attrs, $interval, $window, $timeout, $swipe) {

        var vm = this;

        vm.init = init;
        vm.register = register;
        vm.removeSlide = removeSlide;
        vm.getPages = getPages;
        vm.move = move;
        vm.play = play;
        vm.stop = stop;
        vm.movePage = movePage;

        vm.defaultOptions = {
            displayed: 3,
            perSlide: 1,
            autoplay: true,
            direction: 'horizontal',
            pauseOnHover: true,
            centerActive: false,
            timeInterval: 3000,
            transitionDuration: 500,
            stopAfterAction: false,
            hideNav: false,
            hidePager: false,
            navOnHover: false,
            pagerOnHover: false,
            swipable: true,
            sync: null,
            animation: 'slide',
            loop: true,
            afterSlide: null,
            beforeSlide: null,
            minWidth: null,
            expand: true,
            swipeThreshold: 100
        };

        vm.state = {};

        /////////////////////////

        function init() {
            setElements();
            setClasses();
            setOptions();
            setWatchers();
            setSettings();

            vm.ready = true;
        }

        function getPages() {
            if (vm.slides && vm.options && vm.options.perSlide) {
                return new Array(Math.ceil(vm.slides.length / vm.options.perSlide));
            }
        }

        function setElements() {
            vm.kaarousel = $element[0];
            vm.kaarouselSliderContainer = $element[0].querySelector('kaarousel-slider-container');
            vm.kaarouselWrapper = $element[0].querySelector('kaarousel-wrapper');
            vm.kaarouselSlider = $element[0].querySelector('kaarousel-slider');
        }

        function setClasses() {
            vm.kaarousel.classList.add('kaarousel');
        }

        function getScopeOptions() {
            if (!_.isEmpty($scope.options)) {
                return $scope.options;
            }
            var options = {
                displayed: $scope.displayed,
                perSlide: $scope.perSlide,
                autoplay: $scope.autoplay,
                direction: $scope.direction,
                pauseOnHover: $scope.pauseOnHover,
                centerActive: $scope.centerActive,
                timeInterval: $scope.timeInterval,
                transitionDuration: $scope.transitionDuration,
                updateRate: $scope.updateRate,
                stopAfterAction: $scope.stopAfterAction,
                hideNav: $scope.hideNav,
                hidePager: $scope.hidePager,
                navOnHover: $scope.navOnHover,
                pagerOnHover: $scope.pagerOnHover,
                swipable: $scope.swipable,
                sync: $scope.sync,
                animation: $scope.animation,
                loop: $scope.loop,
                options: $scope.options,
                afterSlide: $scope.afterSlide,
                beforeSlide: $scope.beforeSlide,
                minWidth: $scope.minWidth,
                expand: $scope.expand || true
            };

            options = assumeBoolean(options);

            return options;
        }

        /**
         * Assume that an empty attr means a true value
         * @param  {Object} options Options to check
         * @return {Object}         return back the options
         */
        function assumeBoolean (options) {

            _.forEach(options, function (option, optionName) {
                if($attrs.hasOwnProperty(optionName) && angular.isUndefined(option)) {
                    options[optionName] = true;
                }
            });

            return options;
        }

        /**
         * Custom actions to do when particular settings are changing
         * @param  {String} option the setting
         * @param  {String} value  the setting's value
         */
        function handleImportantChanges(option, value) {
            var fn;
            // Recalculate sizes
            if ((option === 'displayed' || option === 'expand') && !angular.isNumber(vm.options.minWidth)) {
                setSlidesDimensions();
            }
            // Setting classes for the direction & recalculating sizes
            if (option === 'direction') {
                setSliderDirection();
            }
            // Play or stop according to autoplay
            if (option === 'autoplay') {
                fn = value ? 'play' : 'stop';
                vm[fn]();
            }
            if (option === 'swipable') {
                swipeHandler(value);
            }
            // Relaunch when switching back to loop
            if (option === 'loop' && value && !vm.isPlaying && vm.options.autoplay) {
                play();
            }
            if (option === 'transitionDuration') {
                setTransition();
            }
            if (option === 'sync') {
                handleSync(value);
            }
            if (option === 'centerActive') {
                move(vm.currentIndex, false, true);
            }
            if (option === 'minWidth') {
                setSlidesDimensions();
            }
        }

        /**
         * When sync is present it takes over
         * @param  {Number} value the value to sync with
         */
        function handleSync(value) {
            var fn;
            if (vm.options.autoplay) {
                fn = angular.isNumber(value) ? 'stop' : 'play';
                vm[fn]();
            }

            if (angular.isNumber(value)) {
                if (value > vm.slides.length - 1) vm.options.sync = vm.slides.length - 1;
                if (value < 0) vm.options.sync = 0;

                setActive();

                move(Math.floor(vm.options.sync / vm.options.perSlide), false, false);
            }
        }

        /**
         * Add the correct class to kaarousel && recalculate sizes
         */
        function setSliderDirection() {
            var currentClass = vm.options.direction === 'horizontal' ? 'vertical' : 'horizontal';

            vm.kaarousel.classList.remove('direction-' + currentClass);
            vm.kaarousel.classList.add('direction-' + vm.options.direction);

            vm.isHorizontal = vm.options.direction === 'horizontal';
            setSlidesDimensions();
        }

        /**
         * Set the options, if the option parameter is provided then
         * only this option will be changed
         * @param {String} option individual option name
         * @param {*} value  option value
         */
        function setOptions(option, value) {
            vm.options = _.merge({}, vm.defaultOptions, checkValues(getScopeOptions()));

            if (option) {
                vm.options[option] = value;
                vm.options = checkValues(vm.options);
                handleImportantChanges(option, vm.options[option]);
            } else {
                vm.options = checkValues(vm.options);
                setDefaultState();
            }

            setSettings();
        }

        /**
         * Check for incoherences and fixes them
         * @param  {Obejct} options
         * @return {Object}         return the options
         */
        function checkValues(options) {
            if (options.displayed < 1) {
                options.displayed = 1;
            }
            if (options.minWidth) {
                var sliderWidth = vm.kaarouselSliderContainer.offsetWidth;
                options.displayed = Math.floor(sliderWidth / options.minWidth);
            }
            if (!options.perSlide || options.perSlide > options.displayed) {
                options.perSlide = options.displayed;
            }
            if (options.expand && vm.slides.length < options.displayed) {
                options.displayed = vm.slides.length;
            }
            return options;
        }

        /**
         * Set dimensions for each slides
         */
        function setSlidesDimensions(slide) {
            if (angular.isDefined(slide)) {
                // reset old value first
                vm.slides[slide].element.css(vm.isHorizontal ? 'height' : 'width', '');
                // then set the new one
                vm.slides[slide].element.css(vm.isHorizontal ? 'width' : 'height', 100 / vm.options.displayed + '%');
                return;
            }
            $timeout.cancel(vm.dimensionsTimeout);
            vm.dimensionsTimeout = $timeout(function() {
                _.forEach(vm.slides, function(slide) {
                    // reset old value first
                    slide.element.css(vm.isHorizontal ? 'height' : 'width', '');
                    // then set the new one
                    slide.element.css(vm.isHorizontal ? 'width' : 'height', 100 / vm.options.displayed + '%');
                });
                move(vm.currentIndex, false, true);
            }, 200);
        }

        /**
         * Set visibility settings for nav and pagination
         * Also set some state values
         */
        function setSettings() {
            if (!vm.navigation) vm.navigation = {};
            if (!vm.navigation.prev) vm.navigation.prev = {};
            if (!vm.navigation.next) vm.navigation.next = {};
            if (!vm.state) vm.state = {};
            if (!vm.pager) vm.pager = {};

            //////////////////

            var hasEnough = vm.slides.length > vm.options.displayed;

            vm.state.animating = true;
            vm.state.dragging = false;

            vm.navigation.visible = hasEnough && (!vm.options.hideNav || (vm.isHovering && vm.options.navOnHover));
            vm.navigation.prev.visible = !shouldHide('prev');
            vm.navigation.next.visible = !shouldHide('next');

            vm.pager.visible = hasEnough && (!vm.options.hidePager || (vm.isHovering && vm.options.pagerOnHover));
        }

        /**
         * Determine whether or not prev/next should be hidden
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        function shouldHide(type) {
            // If looping nav is always visible
            if (vm.options.loop) {
                return false;
            }
            var response;
            switch (type) {
                case 'prev':
                    response = vm.currentIndex < vm.options.displayed;
                    break;
                case 'next':
                    response = vm.currentIndex > vm.slides.length - vm.options.displayed;
                    break;
            }
            return response;
        }

        /**
         * Set watchers for scope values but also mouse events and window resize
         */
        function setWatchers() {

            // Watch changes in the options
            _.forEach($attrs, function(attribute, attributeName) {
                if (vm.defaultOptions.hasOwnProperty(attributeName)) {
                    $scope.$watch(attributeName, function(nv, ov) {
                        if (nv !== ov) {
                            setOptions(attributeName, nv);
                        }
                    });
                }
            });

            // On resize stop & play after it stopped
            $window.addEventListener('resize', _.debounce(resetAfterWindowResize, 500));
            $window.addEventListener('resize', function() {
                if (vm.isPlaying) {
                    stop();
                }
            });

            // On mouse enter set isHovering & stop if pauseOnHover
            vm.kaarouselWrapper.addEventListener('mouseenter', function() {
                $timeout(function() {
                    vm.isHovering = true;
                    setSettings();

                    if (vm.options.pauseOnHover) {
                        stop();
                    }
                });
            });

            // mouse leave on the slider triggers the touchend to discard swipe
            vm.kaarouselSlider.addEventListener('mouseleave', function() {
                if (vm.state.swipable) {
                    vm.kaarouselSlider.dispatchEvent(new Event('touchend'));
                }
            });

            // On mouse leave set isHovering to false & play if autoPlay
            vm.kaarouselWrapper.addEventListener('mouseleave', function() {
                $timeout(function() {
                    vm.isHovering = false;
                    setSettings();

                    if (vm.options.autoplay && !vm.isPlaying) {
                        play();
                    }
                });
            });

            $scope.$on('$destroy', function() {
                if (vm.isPlaying) {
                    $interval.cancel(vm.interval);
                }
                angular.element(vm.kaarouselSlider).unbind('mousedown mousemove mouseup touchstart touchmove touchend touchcancel');
            });
        }

        /**
         * Re set the slide offset & play
         */
        function resetAfterWindowResize() {
            if (vm.options.minWidth) {
                setOptions();
            }

            vm.move(vm.currentIndex, false, true);

            if (vm.options.autoplay && !vm.stoppedAfterAction) {
                play();
            }
        }

        /**
         * Add a slide to the collection
         * @param  {Object} element DOM element
         */
        function register(element, index) {
            var slide = {
                element: element,
                index: index
            };

            element[0].classList.add('kaarousel-slide');

            if (!vm.slides) {
                vm.slides = [];
            }

            if (!vm.slides[index]) {
                vm.slides[index] = slide;
            } else {
                vm.slides.splice(index, 0, slide);
                setSlidesDimensions(index);
                $timeout(function() {
                    move(vm.currentIndex, null, true);
                }, 150);
            }
        }

        function removeSlide(index) {
            vm.slides.splice(index, 1);
            $timeout(function() {
                move(vm.currentIndex, null, true);
            }, 150);
        }

        /**
         * Set every value to default ones and set transition
         */
        function setDefaultState() {
            vm.currentIndex = 0;
            vm.currentPage = 0;

            setSlidesDimensions();
            setSliderDirection();
            setTransition();

            if (vm.options.autoplay && !angular.isNumber(vm.options.sync)) {
                play();
            }
            if (vm.options.swipable) {
                swipeHandler(true);
            }
            if (angular.isNumber(vm.options.sync)) {
                handleSync(vm.options.sync);
            }
        }

        /**
         * Return the active slide index when moving
         * If a index is provided it goes to the first element in the page
         * Boolean says if it should go forward or backward
         * @param  {Number/Boolean} forward index or boolean
         * @return {Number}
         */
        function getIndex(forward) {
            var index = vm.currentIndex,
                direction,
                nbSlides;

            if (angular.isNumber(forward)) {
                index = forward;
            } else {
                direction = forward ? 1 : -1;
                nbSlides = vm.slides.length - 1;

                index += vm.options.perSlide * direction;

                if (index > nbSlides) {
                    index = 0;
                }

                if (index < 0) {
                    index = Math.ceil(vm.slides.length / vm.options.perSlide) * vm.options.perSlide - vm.options.perSlide;
                }
            }
            return index;
        }

        function movePage (index) {
            move(index * vm.options.perSlide, true);
        }

        /**
         * Determine to which slide it has to slide
         * @return {Number} Slide index
         */
        function getLastInView() {
            var index;
            var ref = vm.options.sync && angular.isNumber(vm.options.sync) ? vm.options.sync : vm.currentIndex;
            var half = Math.floor(vm.options.displayed / 2);

            var limits = {
                down: vm.options.centerActive ? half + 1 : 0,
                up: vm.options.centerActive ? vm.slides.length - half : vm.slides.length - vm.options.displayed
            };

            if (limits.up < 0) {
                limits.up = vm.slides.length;
            }

            if (ref < limits.down) {
                index = ref < limits.down ? 0 : ref;
            }

            if( ref >= limits.down ) {
                index = ref < limits.up ? ref : vm.slides.length - vm.options.displayed;
            }

            if (half % 2 !== 1 && vm.options.centerActive && ref >= limits.down && ref < limits.up) {
                index -= half;
            }

            return vm.slides[index].element[0];
        }

        function applyStyles(offset) {
            if (vm.options.animation !== 'slide') return;

            var elementPos = getLastInView()[vm.isHorizontal ? 'offsetLeft' : 'offsetTop'];

            var property = vm.isHorizontal ? 'translateX' : 'translateY';
            var value = -(elementPos + (offset || 0)) + 'px';

            angular.element(vm.kaarouselSlider).css({
                'transform': property + '(' + value + ')'
            });
        }

        /**
         * Set the current index & page
         * @param  {Boolean/Number}     forward  index or next
         * @param  {Boolean}            userMove is action made by user
         * @param  {replace}            replace  don't increment index just re-apply styles
         */
        function move(forward, userMove, replace) {
            if (vm.options.beforeSlide) {
                vm.options.beforeSlide()();
            }

            vm.currentIndex = replace ? vm.currentIndex : getIndex(forward);
            vm.currentPage = Math.floor(vm.currentIndex / vm.options.perSlide);

            applyStyles();
            setActive();
            setVisible();
            setSettings();

            if (vm.currentIndex > vm.slides.length - vm.options.displayed && !vm.options.loop) {
                stop();
            }

            if (userMove && vm.isPlaying) {
                stop(!vm.options.stopAfterAction);

                if (vm.options.stopAfterAction) {
                    vm.stoppedAfterAction = true;
                }
            }

            if (vm.options.afterSlide) {
                $timeout(function() {
                    vm.options.afterSlide()();
                }, vm.options.transitionDuration);
            }
        }

        function setVisible() {
            _.forEach(vm.slides, function(slide, index) {
                var max = vm.slides.length - vm.options.displayed;
                var isEnd = vm.currentIndex > max && index >= max;
                var isVisible = index >= vm.currentIndex && index < vm.currentIndex + vm.options.displayed || isEnd;

                slide.visible = isVisible;
                slide.element[0].classList[isVisible ? 'add' : 'remove']('visible');
            });
        }

        /**
         * Set active class
         */
        function setActive() {
            var lastActive = _.where(vm.slides, {
                active: true
            });

            if (lastActive.length) {
                lastActive[0].active = false;
                lastActive[0].element[0].classList.remove('active');
            }

            /////////////////////

            var index = vm.options.sync && angular.isNumber(vm.options.sync) ? vm.options.sync : vm.currentIndex;

            vm.slides[index].element[0].classList.add('active');
            vm.slides[index].active = true;
        }

        /**
         * Create interval that moves the slide
         */
        function play() {
            if (vm.isPlaying) return;

            $interval.cancel(vm.interval);

            vm.isPlaying = true;
            vm.interval = $interval(function() {
                move(true);
            }, vm.options.timeInterval);
        }

        /**
         * Cancel the play interval ( temp if relaunch )
         * @param  {Boolean} relaunch Whether or not it should restart
         */
        function stop(relaunch) {
            if (!vm.isPlaying) return;

            vm.isPlaying = false;
            $interval.cancel(vm.interval);

            if (relaunch) {
                $timeout(play, vm.options.transitionDuration);
            }
        }

        function canSwipe() {
            return vm.options.swipable && vm.slides.length > vm.options.displayed;
        }

        function setTransition() {
            vm.state.animating = true;
            angular.element(vm.kaarouselSlider).css('transition-duration', vm.options.transitionDuration / 1000 + 's');
        }

        function removeTransition() {
            vm.state.animating = false;
            angular.element(vm.kaarouselSlider).css('transition-duration', '');
        }

        function addShift(initial, shift) {
            vm.kaarouselSliderContainer.classList.add('dragging');

            var offset, property = vm.options.direction === 'horizontal' ? 'x' : 'y';

            vm.state.dragging = true;

            offset = initial[property] - shift[property];

            applyStyles(offset);
        }

        function removeShift() {
            vm.kaarouselSliderContainer.classList.remove('dragging');

            vm.state.animating = true;
            vm.state.dragging = false;
            setTransition();
        }

        function shouldSwipe(startCoords, lastCoords) {
            var property = vm.options.direction === 'horizontal' ? 'x' : 'y';
            return startCoords && lastCoords && Math.abs(startCoords[property] - lastCoords[property]) > vm.options.swipeThreshold;
        }

        function swipeHandler(bind) {
            vm.state.swipable = bind;

            if (vm.swipeReady) return;

            var lastCoords, startCoords;

            vm.swipeReady = true;

            $swipe.bind(angular.element(vm.kaarouselSlider), {
                start: function(coords) {
                    if (!canSwipe()) {
                        return;
                    }
                    removeTransition();
                    startCoords = coords;
                    lastCoords = null;
                },
                move: function(coords) {
                    if (!canSwipe()) {
                        return;
                    }
                    lastCoords = coords;
                    addShift(startCoords, lastCoords);
                },
                end: function() {

                    if (!canSwipe() || !lastCoords) {
                        return;
                    }

                    removeShift();

                    var displacement = startCoords.x - lastCoords.x;

                    if (shouldSwipe(startCoords, lastCoords)) {
                        if (displacement > 0) {
                            // Left
                            move(true, true, false);
                        } else {
                            // right
                            move(false, true, false);
                        }
                    } else {
                        move(vm.currentIndex, true, true);
                    }
                },
                cancel: function() {
                    if (!canSwipe()) return;
                    removeShift();
                    move(vm.currentIndex, true, true);
                }
            });
        }

    }


})();
