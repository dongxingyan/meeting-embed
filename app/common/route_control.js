"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angular = require("angular");
exports.name = 'me.routeControl';
var RouteControlService = (function () {
    function RouteControlService($rootScope, $state, $transitions) {
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$transitions = $transitions;
        this.stateStack = [];
        this.isIn = true;
        var stateStack = this.stateStack = [];
        // 监听路由变化，管理状态栈
        $transitions.onEnter({}, function (transition) {
            var nextState = transition.to();
            var nowState = stateStack[stateStack.length - 1];
            var prevState = stateStack[stateStack.length - 2];
            var params = transition.params(); // 当前的路由参数
            // 值比较状态名和路由参数，确认是否按回退处理
            var isBack = angular.equals(prevState, { name: nextState.name, params: params });
            if (isBack) {
                stateStack.pop();
            }
            else {
                stateStack.push({ name: nextState.name, params: params });
                var isSame = angular.equals(stateStack[stateStack.length - 1], stateStack[stateStack.length - 2]);
                if (isSame) {
                    stateStack.pop();
                }
            }
            console.log('路由栈:\r\n' + stateStack.map(function (state, index) { return "[" + index + "] " + state.name; }).reverse().join('\r\n'));
        });
        // 屏幕切换的滑动动画
        $transitions.onBefore({}, function (transition) {
            var nextState = transition.to();
            var nowState = stateStack[stateStack.length - 1];
            var prevState = stateStack[stateStack.length - 2];
            var params = transition.params(); // 当前的路由参数
            // 值比较状态名和路由参数，确认是否按回退处理
            var isBack = angular.equals(prevState, { name: nextState.name, params: params });
            var el = document.getElementById('view-container');
            if (isBack) {
                el.className = 'out'; //('direction', 'out');
            }
            else {
                el.className = 'in'; //setAttribute('direction', 'in');
            }
        });
    }
    // 返回键
    RouteControlService.prototype.goBack = function () {
        var target = this.stateStack[this.stateStack.length - 2];
        if (!!target) {
            this.$state.go(target.name, target.params);
        }
    };
    // 从路由栈中弹出当前路由
    RouteControlService.prototype.popThis = function () {
        console.debug('弹出栈顶页面');
        this.stateStack.pop();
    };
    // 原生返回按键被点击
    RouteControlService.prototype.handleNativeBackBtn = function () {
        if (this.stateStack.length > 1) {
            this.goBack();
        }
        else {
            dxtApp.backToDxt();
        }
    };
    return RouteControlService;
}());
RouteControlService.$inject = ['$rootScope', '$state', '$transitions'];
exports.RouteControlService = RouteControlService;
angular.module(exports.name, [])
    .service('RouteControl', RouteControlService)
    .run(['RouteControl', function (rc) {
        window['rc'] = rc;
        if (window['dxtApp']) {
            dxtApp.onBackPressed(function (res) {
                rc.handleNativeBackBtn();
            });
        }
    }]);
//# sourceMappingURL=route_control.js.map