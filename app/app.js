"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('./site.styl');
require('../node_modules/font-awesome/css/font-awesome');
require('swiper/dist/css/swiper.min.css');
require('swiper/dist/js/swiper');
require('angular-swiper/dist/angular-swiper');
require('angular-animate');
require('angular-touch');
var ngscroll = require('ng-infinite-scroll');
var angular = require("angular");
var router = require("angular-ui-router");
var global = require("./global");
var pages = require("./pages/pages");
var common = require("./common/common");
var nuts = require("./components/nuts");
var remote_res = require("./common/remote_resource");
exports.name = 'me.app';
var requires = [router];
angular.module(exports.name, [
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
    function ($stateProvider, $urlRouterProvider, remote, $touchProvider) {
        $urlRouterProvider.otherwise('/loading');
        remote.setServerPath(global.apiPath);
        $touchProvider.ngClickOverrideEnabled(false);
    }
])
    .run([
    'RouteControl', '$rootScope', '$interval',
    function (RouteControl, $rootScope, $interval) {
        // 从路由控制那里获取当前页面切换状态。（是新页面还是回退？）
        $rootScope.isIn = function () { return RouteControl.isIn; };
        // 全局每5秒调用更新一次状态，为my-meeting-room/index的定时器提供。
        $interval(function () { }, 5000);
    }
]);
//# sourceMappingURL=app.js.map