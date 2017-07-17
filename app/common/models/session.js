"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angular = require("angular");
exports.name = 'me.common.models.session';
exports.serviceName = 'SessionService';
var DeviceType;
(function (DeviceType) {
    DeviceType[DeviceType["ANDROID"] = 0] = "ANDROID";
    DeviceType[DeviceType["IOS"] = 1] = "IOS";
    DeviceType[DeviceType["HTML5"] = 2] = "HTML5";
    DeviceType[DeviceType["OTHERS"] = 3] = "OTHERS";
})(DeviceType = exports.DeviceType || (exports.DeviceType = {}));
var SessionService = (function () {
    function SessionService() {
        this.isBindMobile = false;
        this._remainTime = -1; // 会议室剩余可用时间
        this._myMeetingRoom = {
            name: '会议室信息加载中',
            hostPassword: '123456',
            guestPassword: '654321',
            meetingRoomNum: "700025",
        };
        this._inputPageInvitationTheme = this._myMeetingRoom.name; // 输入框：会议邀请/修改或创建 -> 主题输入框
        this._editInvitationCached = {};
        window['session'] = this;
        var params = location.search.split(/[\?&]/).filter(function (x) { return x; }).reduce(function (pv, x) {
            var pair = x.split('=');
            pv[pair[0]] = pair[1];
            return pv;
        }, {});
        window['params'] = params;
        this._deviceType = params.deviceType;
        this._language = params.language;
        this.nickName = decodeURI(params.nickname);
        this.openid = !params.openId ? '2c323adddce9407ba7a1a25997f2a153' : params.openId;
        this.isBindMobile = params.isBindMobile === '1';
        // console.log('session ', this);
    }
    Object.defineProperty(SessionService.prototype, "editInvitationCached", {
        get: function () {
            return this._editInvitationCached;
        },
        set: function (value) {
            this._editInvitationCached = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionService.prototype, "inputPageInvitationTheme", {
        get: function () {
            return this._inputPageInvitationTheme;
        },
        set: function (value) {
            this._inputPageInvitationTheme = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionService.prototype, "remainTime", {
        get: function () {
            return this._remainTime;
        },
        set: function (value) {
            this._remainTime = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionService.prototype, "nickName", {
        get: function () {
            return this._nickName;
        },
        set: function (value) {
            this._nickName = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionService.prototype, "openid", {
        get: function () {
            return this._openid;
        },
        set: function (value) {
            this._openid = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionService.prototype, "myMeetingRoom", {
        get: function () {
            return this._myMeetingRoom;
        },
        set: function (value) {
            this._myMeetingRoom = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionService.prototype, "deviceType", {
        get: function () {
            return this._deviceType;
        },
        set: function (value) {
            this._deviceType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionService.prototype, "language", {
        get: function () {
            return this._language;
        },
        set: function (value) {
            this._language = value;
        },
        enumerable: true,
        configurable: true
    });
    return SessionService;
}());
exports.SessionService = SessionService;
// 依赖的服务名按顺序书写在这里
var dependencies = [];
angular
    .module(exports.name, [])
    .service(exports.serviceName, dependencies.concat([SessionService]));
//# sourceMappingURL=session.js.map