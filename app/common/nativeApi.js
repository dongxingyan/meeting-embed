/**
 * 与NativeApplication通讯的服务
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angular = require("angular");
var global = require("../global");
var angualr = require("angular");
var CheckJsApiParams = (function () {
    function CheckJsApiParams() {
    }
    return CheckJsApiParams;
}());
exports.CheckJsApiParams = CheckJsApiParams;
//enum指DeviceType是枚举类型
var DeviceType;
(function (DeviceType) {
    DeviceType[DeviceType["Android"] = 1] = "Android";
    DeviceType[DeviceType["IOS"] = 2] = "IOS";
    DeviceType[DeviceType["BOX"] = 3] = "BOX";
})(DeviceType = exports.DeviceType || (exports.DeviceType = {}));
var NativeApiService = (function () {
    function NativeApiService(q, _global) {
        this.q = q;
        this._global = _global;
        window['native'] = this;
    }
    /**
     * 检查方法是否支持
     */
    NativeApiService.prototype.checkJsAPI = function (params) {
        var deferred = this.q.defer();
        dxtApp.checkJsApi(params, function (res) {
            deferred.resolve(res);
        });
        return deferred.promise;
    };
    NativeApiService.prototype.showLoading = function (title, content) {
        dxtApp.showLoading({ title: title, content: content });
    };
    NativeApiService.prototype.hideLoading = function () {
        dxtApp.hideLoading();
    };
    /**
     * 检查设备类型
     */
    NativeApiService.prototype.getDeviceType = function () {
        var deferred = this.q.defer();
        dxtApp.getDeviceType(function (res) {
            deferred.resolve(res);
        });
        return deferred.promise;
    };
    /**
     * 检查电信通版本
     */
    NativeApiService.prototype.getVersion = function () {
        var deferred = this.q.defer();
        dxtApp.getVersion(function (res) {
            deferred.resolve(res);
        });
        return deferred.promise;
    };
    /**
     * 检查网络状态
     */
    NativeApiService.prototype.getNetworkType = function () {
        var deferred = this.q.defer();
        dxtApp.getVersion(function (res) {
            deferred.resolve(res);
        });
        return deferred.promise;
    };
    /**
     * 设置浏览器标题
     */
    NativeApiService.prototype.setBrowserTitle = function (req) {
        var deferred = this.q.defer();
        dxtApp.setBrowserTitle(req, function (res) {
            deferred.resolve(res);
        });
        return deferred.promise;
    };
    /**
     * 吐司弹框
     */
    NativeApiService.prototype.showTip = function (req) {
        var deferred = this.q.defer();
        dxtApp.showTip(req, function (res) {
            deferred.resolve(res);
        });
        return deferred.promise;
    };
    /**
     * 消息框
     */
    NativeApiService.prototype.messageBox = function (req) {
        var deferred = this.q.defer();
        dxtApp.messageBox(req, function (res) {
            deferred.resolve(res);
        });
        return deferred.promise;
    };
    /**
     * 对话框
     */
    NativeApiService.prototype.showDialog = function (req) {
        var deferred = this.q.defer();
        dxtApp.showDialog(req, function (res) {
            deferred.resolve(res);
        });
        return deferred.promise;
    };
    NativeApiService.prototype.sendIM = function (cloudpId, msgBody, msgType, msgExtras) {
        return new Promise(function (resolve, reject) {
            dxtApp.sendIM({
                cloudpIds: cloudpId,
                msgBody: msgBody,
                msgType: msgType || 0,
                msgExtras: msgExtras || ''
            }, function (res) {
                resolve(res);
            });
        });
    };
    /**
     * 电信通分享
     */
    NativeApiService.prototype.shareDxt = function (req) {
        console.debug('电信通分享数据包：', req);
        var deferred = this.q.defer();
        dxtApp.shareDxt(req, function (res) {
            deferred.resolve(res);
            console.log(res + "返回的响应");
        });
        return deferred.promise;
    };
    /**
     * 微信分享
     */
    NativeApiService.prototype.shareWechat = function (req) {
        var deferred = this.q.defer();
        dxtApp.shareWechat(req, function (res) {
            // console.log('share: ', req, res);
            deferred.resolve(res);
        });
        return deferred.promise;
    };
    /**
     * QQ通分享
     */
    NativeApiService.prototype.shareQQ = function (req) {
        var deferred = this.q.defer();
        dxtApp.shareQQ(req, function (res) {
            // console.log('share: ', req, res);
            deferred.resolve(res);
        });
        return deferred.promise;
    };
    /**
     * 调用支付页面
     */
    NativeApiService.prototype.dxtAppPay = function (req) {
        return new Promise(function (resolve, reject) {
            dxtApp.dxtAppPay(req, function (res) {
                resolve(res);
            });
        });
    };
    /**
     * 加入会议
     */
    NativeApiService.prototype.joinConference = function (req) {
        var deferred = this.q.defer();
        var _req = angualr.merge(req, { domain: this._global.domain });
        dxtApp.joinConference(_req, function (res) {
            deferred.resolve(res);
            console.log(_req, res + "进入我的会议室");
        });
        return deferred.promise;
    };
    return NativeApiService;
}());
exports.NativeApiService = NativeApiService;
exports.name = 'dxt.api';
exports.servName = 'NativeApi';
angular.module(exports.name, [])
    .factory(exports.servName, [
    global.serv, '$q', 'Global',
    function (global, $q, _global) {
        return new NativeApiService($q, _global);
    }
]);
//# sourceMappingURL=nativeApi.js.map