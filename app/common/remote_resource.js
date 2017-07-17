"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 与远端服务器通讯的服务
 */
var angular = require("angular");
var angualr = require("angular");
/**
 * 可以把类似于1、2、3、4、5变换成"01"、"02"、"03"、"04"、"05"。
 * @param number
 */
exports.fixNum = function (number) { return (number < 10 && number >= 0) ? '0' + number : number + ''; };
/**
 * 把Date对象转换成服务器端的字符串表示法。“2016-10-10 10:10”
 * @param date
 */
exports.toServerDateString = function (date) { return exports.fixNum(date.getUTCFullYear()) + "-" + exports.fixNum(date.getUTCMonth() + 1) + "-" + exports.fixNum(date.getUTCDate()) + " " + exports.fixNum(date.getUTCHours()) + ":" + exports.fixNum(date.getUTCMinutes()) + ":" + exports.fixNum(date.getUTCSeconds()); };
/**
 * 把服务器端的字符串转换成对象（废弃）
 * @param dateStr
 * @returns {Date}
 */
exports.getDateByString = function (dateStr) {
    var servsidFormat = /^\d-\d-\d \d:\d:\d$/;
    if (servsidFormat.test(dateStr)) {
        var arr = dateStr.splice(/[- :]/).map(function (dateStr) {
            return parseInt(dateStr);
        });
        return new Date(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]);
    }
    else {
        return new Date(dateStr);
    }
};
/**
 * 把服务器端的字符串转换成对象
 * @param dateStr
 * @returns {Date}
 */
exports.getDateByServerString = function (dateStr) {
    // console.log(dateStr);
    if (/^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d$/.test(dateStr)) {
        return new Date(dateStr.replace(/[-]/g, '/') + ' GMT');
    }
    else {
        return new Date(dateStr);
    }
};
exports.getFixedDateStr = function (date) {
    var fixNum = function (number) { return (number < 10 && number >= 0) ? '0' + number : number + ''; };
    var datestr = fixNum(date.getMonth() + 1) + "/" + fixNum(date.getDate()); //几月几日
    var now = new Date();
    var today = new Date(now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate());
    var computedTimeleft = date.getTime() - today.getTime();
    if (computedTimeleft > 0 && computedTimeleft < 24 * 3 * 60 * 60 * 1000) {
        datestr = '后天';
        if (computedTimeleft < 24 * 2 * 60 * 60 * 1000) {
            datestr = '明天';
            if (computedTimeleft < 24 * 1 * 60 * 60 * 1000) {
                datestr = '今天';
            }
        }
    }
    else if (computedTimeleft < 0 && computedTimeleft > -1 * 24 * 60 * 60 * 1000) {
        datestr = '昨天';
    }
    else {
        datestr = fixNum(date.getMonth() + 1) + "-" + fixNum(date.getDate());
    }
    return datestr;
};
/**
 * 服务器资源配置
 */
var RemoteResourceProvider = (function () {
    function RemoteResourceProvider() {
        this.$get = [
            '$http', '$q', 'SessionService',
            function ($http, $q, session) {
                return new RemoteResourceService(this._serverPath, $http, $q, session);
            }
        ];
    }
    RemoteResourceProvider.prototype.setServerPath = function (value) {
        this._serverPath = value;
    };
    return RemoteResourceProvider;
}());
exports.RemoteResourceProvider = RemoteResourceProvider;
/**
 * 服务器资源对象
 */
var RemoteResourceService = (function () {
    function RemoteResourceService(serverPath, http, q, session) {
        this.serverPath = serverPath;
        this.http = http;
        this.q = q;
        this.session = session;
        this.apiPaths = {
            login: '/cloudpServer/v1/mmr/login',
            createMeetingRoom: '/cloudpServer/v1/mmr/createMeetingRoom',
            editMeetingRoom: '/cloudpServer/v1/mmr/editMeetingRoom',
            getMeetingRoomInfo: '/cloudpServer/v1/mmr/getmeetingRoomInfo',
            getAccountInfo: '/cloudpServer/v1/mmr/getAccountInfo',
            launchInvitation: '/cloudpServer/v1/mmr/launchInvitation',
            invitationRecord: '/cloudpServer/v1/mmr/invitationRecord',
            editInvitation: '/cloudpServer/v1/mmr/editInvitation',
            cancelInvitation: '/cloudpServer/v1/mmr/cancelInvitation',
            invitationDetail: '/cloudpServer/v1/mmr/invitationDetail',
            getChargingPackage: '/cloudpServer/v1/mmr/getChargingPackage',
            vmrTimeBill: '/cloudpServer/v1/mmr/vmrTimeBill',
            useSchedule: '/cloudpServer/v1/mmr/useSchedule',
            recharge: '/cloudpServer/v1/mmr/recharge',
            generateOrder: '/cloudpServer/v1/pay/generateOrder',
            queryOrder: '/cloudpServer/v1/pay/queryOrder',
        };
        window['remote'] = this;
    }
    RemoteResourceService.prototype.login = function (data) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/login";
        return this.http.get(path, { params: data })
            .then(function (res) {
            // if (res.data.code !== '0') {
            //     return this.q.reject(res.data)
            // }
            return _this.q.resolve(res.data);
        });
    };
    RemoteResourceService.prototype.saveInvitedList = function (invitationId, data) {
        var path = this.serverPath + "/cloudpServer/v1/mmr/saveInvitedList";
        return this.http.post(path, data, {
            params: { openId: this.session.openid, invitationId: invitationId }
        });
    };
    RemoteResourceService.prototype.createMeetingRoom = function () {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/createMeetingRoom";
        return this.http.post(path, {}, {
            params: { openId: this.session.openid }
        })
            .then(function (res) {
            return _this.q.resolve(res.data);
        });
    };
    RemoteResourceService.prototype.editMeetingRoom = function (data) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/editMeetingRoom";
        return this.http.put(path, data, { params: { openId: this.session.openid } })
            .then(function (res) {
            return _this.q.resolve(res.data);
        });
    };
    RemoteResourceService.prototype.getMeetingRoomInfo = function () {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/getmeetingRoomInfo";
        return this.http.get(path, {
            params: {
                openId: this.session.openid
            }
        })
            .then(function (res) {
            // if (res.data.code !== '0') {
            //     return this.q.reject(res.data)
            // }
            return _this.q.resolve(res.data);
        });
    };
    RemoteResourceService.prototype.getAccountInfo = function () {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/getAccountInfo";
        return this.http.get(path, {
            params: { openId: this.session.openid }
        })
            .then(function (res) {
            // if (res.data.code !== '0') {
            //     return this.q.reject(res.data)
            // }
            return _this.q.resolve(res.data);
        });
    };
    RemoteResourceService.prototype.launchInvitation = function (data) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/launchInvitation";
        return this.http({
            method: 'POST',
            url: path,
            params: { openId: this.session.openid },
            data: data
        })
            .then(function (res) {
            if (res.data.code !== '0') {
                return _this.q.reject(res.data);
            }
            return _this.q.resolve(res.data);
        });
    };
    RemoteResourceService.prototype.invitationRecord = function (data) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/invitationRecord";
        return this.http.get(path, {
            params: { openId: this.session.openid, start: data.start, size: data.size }
        })
            .then(function (res) {
            if (res.data.code !== '0') {
                return _this.q.reject(res.data);
            }
            res.data.data.resultList.forEach(function (record) {
                record.startTime = exports.getDateByServerString(record.startTime);
                record.endTime = exports.getDateByServerString(record.endTime);
            });
            return _this.q.resolve(res.data);
        });
    };
    RemoteResourceService.prototype.editInvitation = function (data, params) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/editInvitation?openId=" + this.session.openid + "&invitationId=" + params.invitationId;
        return this.http.put(path, data, {})
            .then(function (res) {
            // if (res.data.code !== '0') {
            //     return this.q.reject(res.data)
            // }
            return _this.q.resolve(res.data);
        });
    };
    RemoteResourceService.prototype.cancelInvitation = function (data) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/cancelInvitation";
        return this.http.post(path, {}, {
            params: angular.merge({ openId: this.session.openid }, data)
        })
            .then(function (res) {
            // if (res.data.code !== '0') {
            //     return this.q.reject(res.data)
            // }
            return _this.q.resolve(res.data);
        });
    };
    RemoteResourceService.prototype.invitationDetail = function (data) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/invitationDetail";
        return this.http.get(path, {
            params: angular.merge({ openId: this.session.openid }, data)
        })
            .then(function (res) {
            var data = res.data;
            // 服务器端传回的是北京时间的字符串（2017-3-10 11:11:11）格式的
            data.data.endTime = exports.getDateByServerString(data.data.endTime);
            data.data.startTime = exports.getDateByServerString(data.data.startTime);
            // 服务器端传回的是个字符串……超无奈的
            try {
                data.data.invitedList = JSON.parse(data.data.invitedList).map(function (x) { return ({ cloudpId: x.dxtNum, avatar: x.avatar, nickname: x.nickname }); });
            }
            catch (e) {
                data.data.invitedList = [];
            }
            return _this.q.resolve(data);
        });
    };
    RemoteResourceService.prototype.getChargingPackage = function () {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/getChargingPackage";
        return this.http.get(path, {
            params: { openId: this.session.openid }
        })
            .then(function (res) {
            if (res.data.code !== '0') {
                return _this.q.reject(res.data);
            }
            return _this.q.resolve(res.data);
        });
    };
    RemoteResourceService.prototype.vmrTimeBill = function (data) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/vmrTimeBill";
        return this.http.get(path, {
            params: angular.merge({ openId: this.session.openid }, data)
        })
            .then(function (res) {
            var data = res.data;
            // console.log('vmr bill request response:', data);
            data.data.resultList.forEach(function (x) {
                x.startTime = exports.getDateByServerString(x.startTime);
                x.endTime = exports.getDateByServerString(x.endTime);
            });
            return _this.q.resolve(data);
        });
    };
    RemoteResourceService.prototype.useSchedule = function (data) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/vmrUseSchedule";
        return this.http.get(path, {
            params: angular.merge({ openId: this.session.openid }, data)
        })
            .then(function (res) {
            var data = res.data;
            data.data.startTime = exports.getDateByServerString(data.data.startTime);
            data.data.endTime = exports.getDateByServerString(data.data.endTime);
            return _this.q.resolve(data);
        });
    };
    RemoteResourceService.prototype.recharge = function (data) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/mmr/recharge";
        return this.http.get(path, {
            params: angular.merge({}, { openId: this.session.openid }, data)
        })
            .then(function (res) {
            // if (res.data.code !== '0') {
            //     return this.q.reject(res.data)
            // }
            var data = res.data;
            data.data.createTime = exports.getDateByServerString(data.data.createTime);
            return _this.q.resolve(data);
        });
    };
    RemoteResourceService.prototype.generateOrder = function (data) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/pay/generateOrder?openId=" + this.session.openid + "&packageId=" + data;
        return this.http.post(path, {
            params: {}
        })
            .then(function (res) {
            if (res.data.code !== '0') {
                return _this.q.reject(res.data);
            }
            return _this.q.resolve(res.data);
        });
    };
    RemoteResourceService.prototype.queryOrder = function (data) {
        var _this = this;
        var path = this.serverPath + "/cloudpServer/v1/pay/queryOrder";
        return this.http.get(path, {
            params: angualr.merge({ openId: this.session.openid }, data)
        })
            .then(function (res) {
            // if (res.data.code !== '0') {
            //     return this.q.reject(res.data)
            // }
            return _this.q.resolve(res.data);
        });
    };
    return RemoteResourceService;
}());
exports.RemoteResourceService = RemoteResourceService;
exports.name = 'me.common.remote_resource';
exports.serviceName = 'RemoteResource';
angular.module(exports.name, [])
    .provider(exports.serviceName, [
    function () {
        return new RemoteResourceProvider();
    }
]);
//# sourceMappingURL=remote_resource.js.map