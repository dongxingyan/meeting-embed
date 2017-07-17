import * as angular from 'angular'
import * as router from 'angular-ui-router';
export let name = 'me.routeControl';
declare let dxtApp;
export class RouteControlService {
    static $inject = ['$rootScope', '$state', '$transitions'];
    stateStack: Array<{ name, params }> = [];
    isIn = true;
    // 返回键
    goBack() {
        let target: router.StateDeclaration = this.stateStack[this.stateStack.length - 2];
        if (!!target) {
            this.$state.go(target.name, target.params);
        }
    }
    // 从路由栈中弹出当前路由
    popThis() {
        console.debug('弹出栈顶页面')
        this.stateStack.pop();
    }
    // 原生返回按键被点击
    handleNativeBackBtn() {
        if (this.stateStack.length > 1) {
            this.goBack();
        } else {
            dxtApp.backToDxt();
        }
    }
    constructor(public $rootScope: angular.IRootScopeService,
        public $state: router.StateService,
        public $transitions: router.TransitionService) {

        let stateStack = this.stateStack = [];

        // 监听路由变化，管理状态栈
        $transitions.onEnter({}, (transition) => {
            let nextState = transition.to();
            let nowState = stateStack[stateStack.length - 1];
            let prevState = stateStack[stateStack.length - 2];
            let params = transition.params(); // 当前的路由参数
            // 值比较状态名和路由参数，确认是否按回退处理
            let isBack = angular.equals(prevState, { name: nextState.name, params: params });
            if (isBack) {
                stateStack.pop();
            } else {
                stateStack.push({ name: nextState.name, params: params });
                let isSame = angular.equals(stateStack[stateStack.length - 1], stateStack[stateStack.length - 2]);
                if (isSame) {
                    stateStack.pop();
                }
            }
            console.log('路由栈:\r\n' + stateStack.map((state, index) => `[${index}] ` + state.name).reverse().join('\r\n'));
        });
        // 屏幕切换的滑动动画
        $transitions.onBefore({}, transition => {
            let nextState = transition.to();
            let nowState = stateStack[stateStack.length - 1];
            let prevState = stateStack[stateStack.length - 2];
            let params = transition.params(); // 当前的路由参数
            // 值比较状态名和路由参数，确认是否按回退处理
            let isBack = angular.equals(prevState, { name: nextState.name, params: params });
            let el = document.getElementById('view-container');
            if (isBack) {
                el.className = 'out';//('direction', 'out');
            } else {
                el.className = 'in'; //setAttribute('direction', 'in');
            }
        })
    }
}

angular.module(name, [])
    .service('RouteControl', RouteControlService)
    .run(['RouteControl', (rc: RouteControlService) => {
        window['rc'] = rc;
        if (window['dxtApp']) {
            dxtApp.onBackPressed((res) => {
                rc.handleNativeBackBtn();
            });
        }
    }]);