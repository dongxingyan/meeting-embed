"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var remote_resource_1 = require("../../common/remote_resource");
require('./recharge_style');
var angular = require("angular");
var remote = require("../../common/remote_resource");
var nativeModule = require("../../common/nativeApi");
var session = require("../../common/models/session");
exports.name = 'me.pages.recharge';
exports.components = {
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
var recharge = angular.module(exports.name, []);
/**
 * 充值首页
 */
recharge.component(exports.components.index.name, {
    template: exports.components.index.template,
    controller: [
        '$state', '$scope', remote.serviceName, nativeModule.servName, session.serviceName, 'RouteControl', 'Global',
        function ($state, $scope, remote, native, session, routeControl, global) {
            $scope.chargingPackages = [];
            $scope.minutesLeft = '未知';
            $scope.handleRechargeBtnClick = function (target) {
                var meetingRoomNum = session.myMeetingRoom.meetingRoomNum; //会客厅号
                var nowTime = new Date().getTime();
                var valid = new Date(nowTime + (target.validPeriod) * 24 * 60 * 60 * 1000);
                console.log(valid);
                var outDate = remote_resource_1.fixNum(valid.getFullYear() + "年" + remote_resource_1.fixNum(valid.getMonth() + 1) + "月" + remote_resource_1.fixNum(valid.getDate()) + "日");
                console.log(outDate);
                remote
                    .generateOrder(target.id)
                    .then(function (res) {
                    var orderNum = res.data.orderNum;
                    var notifyUrl = res.data.notifyUrl;
                    var total_fee = target.price;
                    var time = target.duration;
                    var req = {
                        appid: 'dxt24715772077015046',
                        openid: session.openid,
                        app_trade_no: orderNum,
                        good_title: '视频会客包充值',
                        // good_detail: '电信通充值： ' + total_fee / 100 + '元，' + time + '秒钟。',
                        good_detail: '为' + meetingRoomNum + '充值' + time / 60 + '分钟，有效期至' + outDate,
                        total_fee: total_fee,
                        pay_channel: '',
                        notify_url: remote.serverPath + notifyUrl
                    };
                    console.log('充值请求对象：', req);
                    native.dxtAppPay(req).then(function (res) {
                        console.log('充值返回：', res);
                        if (res.resultCode == '0') {
                            // console.log('if - true')
                            remote.queryOrder({ orderNum: orderNum }).then(function (res) {
                                // console.log('queryOrder');
                                session.myMeetingRoom.remainTime = res.data.remainTime;
                                session.remainTime = res.data.remainTime;
                                $state.go(exports.components.success.name, {
                                    time: time,
                                    money: total_fee,
                                    remain: Math.floor(res.data.remainTime / 60),
                                });
                            }).catch(function (reason) {
                                // console.log('catch')
                                native.messageBox({ title: '提示', content: '支付失败。' });
                            });
                        }
                        else {
                            // console.log('if - false')
                            native.messageBox({ title: '提示', content: '支付失败。' });
                        }
                        // routeControl.goBack();
                    });
                });
            };
            $scope.minutesLeft = Math.floor(session.myMeetingRoom.remainTime / 60) + '';
            remote.getAccountInfo()
                .then(function (res) {
                $scope.minutesLeft = Math.floor(res.data.remainTime / 60) + '';
            });
            $scope.secondToMinute = function (second) { return Math.floor(second / 60); };
            remote.getChargingPackage()
                .then(function (res) {
                $scope.chargingPackages = res.data.map(function (item, index) { return ({
                    id: item.id,
                    price: item.price,
                    duration: item.duration,
                    validPeriod: item.validPeriod,
                    className: ['car-bgI0', 'car-bgI1', 'car-bgI2', 'car-bgI3'][index % 4]
                }); });
            });
        }
    ]
});
/**
 * 充值成功
 */
recharge.component(exports.components.success.name, {
    template: exports.components.success.template,
    controller: ['$scope', '$stateParams', session.serviceName, 'RouteControl',
        function ($scope, $stateParams, sessionServ, routeControl) {
            var time = $scope.time = Math.floor($stateParams.time / 60);
            $scope.money = $stateParams.money / 100;
            // let money = $scope.money = $stateParams.money.toString;
            var remain = $scope.remain = $stateParams.remain;
            $scope.meetingRoomNum = sessionServ.myMeetingRoom.meetingRoomNum;
            $scope.handleOkBtnClick = function () {
                routeControl.popThis();
                routeControl.goBack();
            };
            $scope.handleContinueBtnClick = function () {
                routeControl.goBack();
            };
        }]
});
/**
 * 充值失败
 */
recharge.component(exports.components.failure.name, {
    template: exports.components.failure.template,
    controller: ['$scope', function ($scope) { }]
});
/**
 * 充值确认
 */
recharge.component(exports.components.confirm.name, {
    template: exports.components.confirm.template,
    controller: ['$scope', function ($scope) { }]
});
/**
 * 路由设置
 */
recharge.config([
    '$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state({
            name: exports.components.index.name,
            url: '/recharge/index',
            component: exports.components.index.name
        })
            .state({
            name: exports.components.success.name,
            url: '/recharge/success/:time/:money/:remain',
            component: exports.components.success.name
        })
            .state({
            name: exports.components.failure.name,
            url: '/recharge/failure',
            component: exports.components.failure.name
        })
            .state({
            name: exports.components.confirm.name,
            url: '/recharge/confirm',
            component: exports.components.confirm.name
        });
    }
]);
//# sourceMappingURL=recharge.js.map