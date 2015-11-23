# Angular Kaarousel

Full angularJS carousel

[DEMO](http://corentin-gautier.github.io/angular-kaarousel/)

=================

## How to use it

```html
    <kaarousel
        displayed="conf.displayed"
        per-slide="conf.perSlide"
        autoplay="conf.autoplay"
        direction="conf.direction"
        pause-on-hover="conf.pauseOnHover"
        center-active="conf.centerActive"
        time-interval="conf.timeInterval"
        stop-after-action="conf.stopAfterAction"
        hide-nav="conf.hideNav"
        hide-pager="conf.hidePager"
        nav-on-hover="conf.navOnHover"
        pager-on-hover="conf.pagerOnHover"
        swipable="conf.swipable"
        sync="conf.sync"
        loop="conf.loop"
        min-width="conf.minWidth"
        expand="conf.expand"
        transition-duration="conf.transitionDuration"
        before-slide="conf.beforeSlide"
        after-slide="conf.afterSlide">
        <kaarousel-slide ng-repeat="slide in slides track by $index" >
            <!-- PUT SOME HTML HERE -->
        </kaarousel-slide>
    </kaarousel>
```

Or you can just pass an option object ( options takes over everything else though and callbacks should always be in attributes ) :

```html
    <kaarousel options="myOptions" before-slide="someFunction" ></kaarousel>
```

Every boolean attributes are assumed true when empty:

```html
    <kaarousel swipable loop hide-pager>
```

## Options

Default configuration is :

```javascript
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
```

## Todo

- Fade animation
- add code sample to online doc
