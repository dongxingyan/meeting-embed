import {fixNum} from "../../common/remote_resource";
declare let require; // 为webpack的require语法所做的特殊声明

require('./recharge_style');

import * as angular from 'angular';
import * as router from 'angular-ui-router';

import * as remote from '../../common/remote_resource';
import { IChargingPackage, IGetChargingPackageRequest, IGetChargingPackageResponse } from '../../common/models/business/GetChargingPackage';
import * as nativeModule from '../../common/nativeApi';
import * as session from '../../common/models/session';

export let name = 'me.pages.recharge';
export let components = {
    index: {
        name: "rechargeIndex",
        template: require('./recharge.tmpl.html')
    },
    success: {
        name: "rechargeSuccess",
        template: require('./recharge_success.tmpl.html')
    },
    failure: {
        name: "rechargeFailure",
        template: require('./recharge_failure.tmpl.html')
    },
    confirm: {
        name: "rechargeConfirm",
        template: require('./recharge_confirm.tmpl.html')
    }
};
let recharge = angular.module(name, []);


/**
 * 充值页面
 */
interface IRechargeScope extends angular.IScope {
    chargingPackages: any[];
    minutesLeft: string;
    handleRechargeBtnClick: (target: IChargingPackage) => void;
    secondToMinute: (second: number) => number;
}
/**
 * 充值首页
 */
recharge.component(components.index.name, {
    template: components.index.template,
    controller: [
        '$state', '$scope', remote.serviceName, nativeModule.servName, session.serviceName, 'RouteControl', 'Global',
        function (
            $state: router.StateService,
            $scope: IRechargeScope,
            remote: remote.RemoteResourceService,
            native: nativeModule.NativeApiService,
            session: session.SessionService,
            routeControl,
            global
        ) {
            $scope.chargingPackages = [];
            $scope.minutesLeft = '未知';
            $scope.handleRechargeBtnClick = (target) => {
                let meetingRoomNum=session.myMeetingRoom.meetingRoomNum;//会客厅号
                let nowTime=new Date().getTime();
                let valid=new Date(nowTime+(target.validPeriod)*24*60*60*1000);
                console.log(valid)
                let outDate=fixNum(valid.getFullYear()+"年"+fixNum(valid.getMonth()+1)+"月"+fixNum(valid.getDate())+"日")
                console.log(outDate)
                remote
                    .generateOrder(target.id)
                    .then(res => {
                        let orderNum = res.data.orderNum;
                        let notifyUrl = res.data.notifyUrl;
                        let total_fee = target.price;
                        let time = target.duration;
                        let req = {
                            appid: 'dxt24715772077015046',
                            openid: session.openid,
                            app_trade_no: orderNum,
                            good_title: '视频会客包充值',
                            // good_detail: '电信通充值： ' + total_fee / 100 + '元，' + time + '秒钟。',
                            good_detail: '为' + meetingRoomNum  + '充值' + time/60 + '分钟，有效期至'+outDate,
                            total_fee: total_fee, //单位：分(充值金额）
                            pay_channel: '', //wxpay|alipay|apple
                            notify_url: remote.serverPath + notifyUrl
                        };
                        console.log('充值请求对象：', req);
                        native.dxtAppPay(req).then(res => {
                            console.log('充值返回：', res);
                            if (res.resultCode == '0') {
                                // console.log('if - true')
                                remote.queryOrder({ orderNum: orderNum }).then(res => {
                                    // console.log('queryOrder');
                                    session.myMeetingRoom.remainTime = res.data.remainTime;
                                    session.remainTime = res.data.remainTime;
                                    $state.go(components.success.name, {
                                        time: time,
                                        money: total_fee,
                                        remain: Math.floor(res.data.remainTime / 60),
                                    })
                                }).catch(reason => {
                                    // console.log('catch')
                                    native.messageBox({ title: '提示', content: '支付失败。' })
                                })
                            } else {
                                // console.log('if - false')
                                native.messageBox({ title: '提示', content: '支付失败。' })
                            }
                            // routeControl.goBack();
                        })
                    })
            }
            $scope.minutesLeft = Math.floor(session.myMeetingRoom.remainTime / 60) + '';
            remote.getAccountInfo()
                .then((res) => {
                    $scope.minutesLeft = Math.floor(res.data.remainTime / 60) + '';
                })
            $scope.secondToMinute = (second) => Math.floor(second / 60);
            remote.getChargingPackage()
                .then(res => {
                    $scope.chargingPackages = res.data.map((item, index) => ({
                        id:item.id,
                        price: item.price,
                        duration: item.duration,
                        validPeriod:item.validPeriod,
                        className: ['car-bgI0', 'car-bgI1', 'car-bgI2', 'car-bgI3'][index % 4]

                    }));
                })

        }]
});
/**
 * 充值成功
 */
recharge.component(components.success.name, {
    template: components.success.template,
    controller: ['$scope', '$stateParams', session.serviceName, 'RouteControl',
        function ($scope, $stateParams, sessionServ: session.SessionService, routeControl) {
            let time = $scope.time = Math.floor($stateParams.time / 60);
            $scope.money = $stateParams.money / 100;
            // let money = $scope.money = $stateParams.money.toString;
            let remain = $scope.remain = $stateParams.remain;
            $scope.meetingRoomNum = sessionServ.myMeetingRoom.meetingRoomNum;
            $scope.handleOkBtnClick = () => {
                routeControl.popThis();
                routeControl.goBack();
            }
            $scope.handleContinueBtnClick = () => {
                routeControl.goBack();
            }
        }]
});
/**
 * 充值失败
 */
recharge.component(components.failure.name, {
    template: components.failure.template,
    controller: ['$scope', function ($scope) { }]
});
/**
 * 充值确认
 */
recharge.component(components.confirm.name, {
    template: components.confirm.template,
    controller: ['$scope', function ($scope) { }]
});
/**
 * 路由设置
 */
recharge.config([
    '$stateProvider',
    function ($stateProvider: router.StateProvider) {
        $stateProvider
            .state({
                name: components.index.name,
                url: '/recharge/index',
                component: components.index.name
            })
            .state({
                name: components.success.name,
                url: '/recharge/success/:time/:money/:remain',
                component: components.success.name
            })
            .state({
                name: components.failure.name,
                url: '/recharge/failure',
                component: components.failure.name
            })
            .state({
                name: components.confirm.name,
                url: '/recharge/confirm',
                component: components.confirm.name
            })
    }
])