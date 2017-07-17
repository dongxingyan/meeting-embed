declare let require;
require('./site.styl');
require('../node_modules/font-awesome/css/font-awesome');
require('swiper/dist/css/swiper.min.css');
require('swiper/dist/js/swiper');
require('angular-swiper/dist/angular-swiper');
require('angular-animate');
require('angular-touch');
let ngscroll = require('ng-infinite-scroll');


import * as angular from 'angular'
import * as router from "angular-ui-router";


import * as global from './global'
import * as pages from './pages/pages';
import * as common from './common/common';
import * as nuts from './components/nuts'
import * as remote_res from './common/remote_resource'
import * as native_api from './common/nativeApi'

export let name = 'me.app';

let requires = [router];

angular.module(name, [
    'ui.router',
    'ksSwiper',
    'ngTouch',
    'ngAnimate',
    ngscroll,
    global.name,
    pages.name,
    common.name,
    nuts.name,
])
    .config([
        '$stateProvider', '$urlRouterProvider', remote_res.serviceName + 'Provider', '$touchProvider',
        function ($stateProvider: router.StateProvider,
            $urlRouterProvider: router.UrlRouter,
            remote: remote_res.RemoteResourceProvider,
            $touchProvider
        ) {
            $urlRouterProvider.otherwise('/loading');
            remote.setServerPath(global.apiPath);
            $touchProvider.ngClickOverrideEnabled(false);
        }
    ])
    .run([
        'RouteControl', '$rootScope', '$interval',
        function (RouteControl, $rootScope, $interval) {
            // 从路由控制那里获取当前页面切换状态。（是新页面还是回退？）
            $rootScope.isIn = () => RouteControl.isIn;
            // 全局每5秒调用更新一次状态，为my-meeting-room/index的定时器提供。
            $interval(() => { }, 5000);
        }
    ]);