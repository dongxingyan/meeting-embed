/*
 * 会议邀请相关的页面，全部逻辑集中于此
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('./invitation_style');
var angular = require("angular");
var sessionModule = require("../../common/models/session");
var nativeModule = require("../../common/nativeApi");
var remote_res = require("../../common/remote_resource");
var Global = require("../../global");
var defaultAvatar = require('../../res/imgs/avatar.png');
/**
 * 模块的名字
 */
exports.name = 'me.pages.invitation';
/**
 * 几个组件的相关信息（这个项目里，一个页面对应一个组件）
 */
exports.components = {
    // 新建会议邀请页面
    create: {
        name: 'invitationCreate',
        template: require('./create.tmpl_v2.3.html')
    },
    // 新建会议邀请后，选择参会者的页面
    invite: {
        name: 'invitationInvite',
        template: require('./create_invite.tmpl_v2.3.html')
    },
    // 邀请详情页面（废弃）
    detail: {
        name: 'invitationDetail',
        template: require('./detail.tmpl.html')
    },
    // 设置会议主题页面
    setupTheme: {
        name: 'invitationSetupTheme',
        template: require('./setup_theme.tmpl.html')
    },
    // 编辑会议邀请页面
    edit: {
        name: 'invitationEdit',
        template: require('./edit.tmpl.html')
    }
};
var invitation = angular.module(exports.name, []);
// 调用原生分享（分享到电信通、微信或者QQ，其中分享到电信通可能需要更多信息（适用于2.3以后版本））
var share = function (native, type, res, name, link, imgUrl, mTitle, mTime, mId, mPwd, mEndTime) {
    imgUrl = Global.shareImgUrl;
    var queryStr = "?invitationId=" + res.data.invitationId;
    var queryStr1 = "?invitationId=" + res.data.invitationId + "&mEndTime=" + mEndTime;
    console.debug('share time:', typeof mTime);
    console.log(mEndTime);
    switch (type) {
        case 'dxt':
            return native.shareDxt({
                title: '会客邀请',
                desc: res.data.message1,
                link: link + queryStr,
                imgUrl: imgUrl,
                mTitle: mTitle,
                mTime: mTime,
                mId: mId,
                mPwd: mPwd,
                mEndTime: mEndTime
            });
        case 'qq':
            return native.shareQQ({
                title: '做客邀请通知',
                desc: '特邀您加入我的贵宾会客厅。点击查看详情。',
                link: link + queryStr1,
                imgUrl: imgUrl,
            });
        case 'wx':
            return native.shareWechat({
                title: '做客邀请通知',
                desc: '特邀您加入我的贵宾会客厅。点击查看详情。',
                link: link + queryStr1,
                imgUrl: imgUrl,
            });
    }
};
// 给一组受邀嘉宾的信息，从中去除重复项。（用于创建会议后的邀请页面和编辑页面的邀请功能）
var singlefyByCloudpId = function (array) { return array.reduce(function (list, item) {
    if (list.filter(function (x) { return x.cloudpId === item.cloudpId; }).length > 0) {
        return list;
    }
    else {
        return list.concat(item);
    }
}, []); };
// 创建会议邀请页面
invitation.component(exports.components.create.name, {
    template: exports.components.create.template,
    bindings: {},
    controller: [
        '$scope', remote_res.serviceName, sessionModule.serviceName, nativeModule.servName, 'RouteControl', '$state',
        function ($scope, remote, session, native, routeControl, $state) {
            $scope.invitationTypes = [
                { url: require('../../res/imgs/dxt-logo1.png'), name: '大麦家视宝', type: 'dxt' },
                { url: require('../../res/imgs/qq-logo.png'), name: 'QQ好友', type: 'qq' },
                { url: require('../../res/imgs/wx-logo.png'), name: '微信好友', type: 'wx' },
            ];
            session.inputPageInvitationTheme || (session.inputPageInvitationTheme = session.myMeetingRoom.name);
            $scope.theme = function () { return session.inputPageInvitationTheme ? session.inputPageInvitationTheme : ''; }; // 从session服务中拿到存储的会议主题
            var timeValues = $scope.timeValues = {
                startTime: new Date(Date.now() + 30 * 60 * 1000),
                duration: new Date('1970/1/1 1:0:0'),
                durationValue: "60"
            };
            window['scope'] = $scope;
            $scope.showChange = function () {
                var str = '';
                str += $scope.getStartDate();
                str += ' , ' + $scope.getStartTime();
                str += ' , ' + $scope.getDuration();
            };
            var fixNum = remote_res.fixNum;
            $scope.getStartDate = function () {
                var date = $scope.timeValues.startTime || ($scope.timeValues.startTime = new Date());
                return fixNum(date.getFullYear()) + "-" + fixNum(date.getMonth() + 1) + "-" + fixNum(date.getDate());
            };
            $scope.getStartTime = function () {
                var time = $scope.timeValues.startTime || ($scope.timeValues.startTime = new Date());
                return fixNum(time.getHours()) + ":" + fixNum(time.getMinutes());
            };
            $scope.getDuration = function () {
                var time = $scope.timeValues.duration || ($scope.timeValues.duration = new Date('1970/1/1 1:0:0'));
                return fixNum(time.getHours()) + ":" + fixNum(time.getMinutes());
            };
            $scope.getEndTime = function () {
                var durationTime = $scope.invitation.duration || ($scope.invitation.duration = new Date('1970/1/1 1:0:0'));
                var duration = durationTime.getHours() * 60 * 60 * 1000 + durationTime.getSeconds() * 60 * 1000;
                var endTime = new Date($scope.invitation.startTime.getTime() + duration);
                return fixNum(endTime.getHours()) + ":" + fixNum(endTime.getMinutes());
            };
            // 发送邀请的次数 大于0则只分享，不创建
            var launchInvitationCount = 0;
            // 缓存下来的邀请信息
            var launchInvitationCachedResponse;
            // let shareBtnClicked = false;
            $scope.invite = function (type) {
                // 检查时间
                if (timeValues.startTime.getTime() < Date.now()) {
                    native.messageBox({ title: '提示', content: '会客的开始时间不可早于当前时间。' });
                    return;
                }
                $scope.waiting = true;
                //  分享邀请链接
                if (launchInvitationCount > 0) {
                    // 这里的代码没有意义
                    share(native, type, launchInvitationCachedResponse, $scope.theme(), Global.shareUrl + '/invitation.html', '', $scope.session.inputPageInvitationTheme, $scope.getStartDate() + " " + $scope.getStartTime() + " - " + $scope.getEndTime(), session.myMeetingRoom.meetingRoomNum + '', session.myMeetingRoom.guestPassword).then(function (res) {
                        if (res.resultCode != 0) {
                            native.messageBox({ title: '提示', content: '分享失败。' });
                            $scope.waiting = false;
                        }
                        else {
                            routeControl.goBack();
                        }
                    });
                }
                else {
                    var dHours = void 0, dMinutes = void 0;
                    dHours = timeValues.duration.getHours();
                    dMinutes = timeValues.duration.getMinutes();
                    remote.launchInvitation({
                        theme: session.inputPageInvitationTheme,
                        startTime: remote_res.toServerDateString(timeValues.startTime),
                        // endTime: remote_res.toServerDateString(new Date(timeValues.startTime.getTime() + (dHours * 60 + dMinutes) * 60 * 1000))
                        endTime: remote_res.toServerDateString(new Date(timeValues.startTime.getTime() + (parseInt(timeValues.durationValue)) * 60 * 1000))
                    })
                        .then(function (res) {
                        if (res.code === '999') {
                            console.debug('服务器内部错误');
                        }
                        //创建邀请页面在点击返回按钮时略过直接返回主页，所以需要出栈
                        routeControl.popThis();
                        $state.go('invitationInvite', { invitationId: res.data.invitationId });
                    })
                        .catch(function (error) {
                        console.debug('网络错误', error);
                    });
                }
            };
        }
    ]
});
invitation.component(exports.components.setupTheme.name, {
    template: exports.components.setupTheme.template,
    controller: ['$scope', sessionModule.serviceName, 'RouteControl', '$stateParams', remote_res.serviceName,
        function ($scope, session, RouteControl, $stateParams, remoteServ) {
            var data = $scope.data = {};
            data.theme = session.inputPageInvitationTheme === '' ? '' : session.inputPageInvitationTheme;
            console.log($stateParams.invitationId + "邀请id");
            if ($stateParams.invitationId) {
                $scope.save = function () {
                    // remoteServ.editInvitation()
                    remoteServ.invitationDetail({ invitationId: $stateParams.invitationId })
                        .then(function (res) {
                        var _data = angular.merge({}, res.data);
                        _data.theme = data.theme;
                        var requestData = {
                            startTime: remote_res.toServerDateString(_data.startTime),
                            endTime: remote_res.toServerDateString(_data.endTime),
                            theme: _data.theme,
                        };
                        return remoteServ.editInvitation(requestData, { invitationId: $stateParams.invitationId });
                    })
                        .then(function (res) {
                        console.log('主题以保存，返回上一页面', res);
                        session.inputPageInvitationTheme = data.theme;
                        RouteControl.goBack();
                    })
                        .catch(function (reason) {
                        // console.log(reason);
                    });
                };
            }
            else {
                $scope.save = function () {
                    session.inputPageInvitationTheme = data.theme;
                    RouteControl.goBack();
                };
            }
            $scope.delInput = function () {
                // console.log($scope.theme)
            };
        }]
});
invitation.component(exports.components.detail.name, {
    template: exports.components.detail.template,
    bindings: {},
    controller: ['$scope', function ($scope) {
        }]
});
invitation.component(exports.components.edit.name, {
    template: exports.components.edit.template,
    bindings: {},
    controllerAs: 'vm',
    controller: [
        '$scope',
        'ActionSheet',
        '$stateParams',
        sessionModule.serviceName,
        remote_res.serviceName,
        nativeModule.servName,
        'RouteControl',
        'NutModal',
        function ($scope, ActionSheet, 
            /** 路由参数 */
            $routeParams, sessionServ, remoteServ, native, routeControl, NutModal) {
            var invitationId = this.invitationId = $routeParams.invitationId;
            // 分享按钮被点击
            $scope.handleShareBtnCLick = function (type) {
                share(native, type, {
                    data: {
                        message1: sessionServ.nickName + "\u7279\u9080\u60A8\u52A0\u5165\u6211\u7684\u8D35\u5BBE\u4F1A\u5BA2\u5385\uFF0C\u70B9\u51FB " + (Global.shareUrl + '/invitation.html?invitationId=' + invitationId) + " \u67E5\u770B\u4F1A\u8BAE\u8BE6\u60C5\u3002",
                        message2: sessionServ.nickName + "\u7279\u9080\u60A8\u52A0\u5165\u6211\u7684\u8D35\u5BBE\u4F1A\u5BA2\u5385\uFF0C\u70B9\u51FB " + (Global.shareUrl + '/invitation.html?invitationId=' + invitationId) + " \u67E5\u770B\u4F1A\u8BAE\u8BE6\u60C5\u3002",
                        invitationId: invitationId
                    }
                }, $scope.invitation.theme, Global.shareUrl + '/invitation.html', '', $scope.invitation.theme, $scope.getStartDate() + " " + $scope.getStartTime() + " - " + $scope.getEndTime(), sessionServ.myMeetingRoom.meetingRoomNum + '', sessionServ.myMeetingRoom.guestPassword, $scope.getStartDate() + ' ' + $scope.getEndTime()).then(function (res) {
                    console.log($scope.getStartTime(), $scope.getEndTime());
                    // console.log(res);
                    console.log(res);
                    if (res.resultCode != 0) {
                        native.messageBox({ title: '提示', content: '分享失败。' });
                    }
                    else {
                        // TODO： 分享成功之后的处理
                        if (res.cloudpIds) {
                            var list = res.cloudpIds;
                            $scope.guestList = $scope.guestList ? $scope.guestList.concat(list) : list;
                            console.log($scope.guestList + "打印出来的");
                            $scope.guestList = singlefyByCloudpId($scope.guestList);
                            $scope.guestList.forEach(function (x) {
                                if (!x.avatar) {
                                    x.avatar = defaultAvatar;
                                }
                            });
                            remoteServ
                                .saveInvitedList(invitationId, $scope.guestList.map(function (x) { return ({
                                dxtNum: x.cloudpId,
                                avatar: x.avatar || defaultAvatar,
                                nickname: x.nickname
                            }); }))
                                .then(function (res) {
                                console.debug('保存成功:', res);
                            })
                                .catch(function (error) {
                                console.debug('保存失败:', error);
                            });
                        }
                    }
                });
            };
            // 邀请类型
            $scope.invitationTypes = [
                { url: require('../../res/imgs/dxt-logo1.png'), name: '大麦家视宝', type: 'dxt' },
                { url: require('../../res/imgs/qq-logo.png'), name: 'QQ好友', type: 'qq' },
                { url: require('../../res/imgs/wx-logo.png'), name: '微信好友', type: 'wx' },
            ];
            // 设置主题被点击
            $scope.handleSetupTheme = function () {
                sessionServ.inputPageInvitationTheme = $scope.invitation.theme;
                // console.log($scope.invitation);
            };
            // 数字补齐'0'的函数
            var fixNum = remote_res.fixNum;
            $scope.getStartDate = function () {
                var date = $scope.invitation.startTime || ($scope.invitation.startTime = new Date());
                return fixNum(date.getFullYear()) + "-" + fixNum(date.getMonth() + 1) + "-" + fixNum(date.getDate());
            };
            $scope.getStartTime = function () {
                var time = $scope.invitation.startTime || ($scope.invitation.startTime = new Date());
                return fixNum(time.getHours()) + ":" + fixNum(time.getMinutes());
            };
            $scope.getDuration = function () {
                var time = $scope.invitation.duration || ($scope.invitation.duration = new Date('1970/1/1 1:0:0'));
                return fixNum(time.getHours()) + ":" + fixNum(time.getMinutes());
            };
            $scope.getEndTime = function () {
                var durationTime = $scope.invitation.duration || ($scope.invitation.duration = new Date('1970/1/1 1:0:0'));
                var duration = durationTime.getHours() * 60 * 60 * 1000 + durationTime.getMinutes() * 60 * 1000;
                var endTime = new Date($scope.invitation.startTime.getTime() + duration);
                console.log(endTime);
                return fixNum(endTime.getHours()) + ":" + fixNum(endTime.getMinutes());
            };
            $scope.transTimeStamp = function (date) {
                var data = (new Date(date).getTime()) / 1000;
                return data + '';
            };
            var sendEditRequest = function () {
                var invitation = $scope.invitation;
                var theme = invitation.theme;
                var _startTime = invitation.startTime;
                var _duration = invitation.duration;
                var durationValue = invitation.durationValue;
                var startTime = remote_res.toServerDateString(_startTime);
                var hh = _duration.getHours();
                var mm = _duration.getMinutes();
                var sss = hh * 60 * 60 * 1000 + mm * 60 * 1000;
                // let _endTime = new Date(_startTime.getTime() + sss);
                var _endTime = new Date(_startTime.getTime() + parseInt(durationValue) * 60 * 1000);
                var endTime = remote_res.toServerDateString(_endTime);
                if (_startTime.getTime() < Date.now()) {
                    native.messageBox({ title: '注意', content: '您选择的会议开始时间早于当前时间。' });
                    // return;
                }
                remoteServ.editInvitation({ theme: theme, startTime: startTime, endTime: endTime }, { invitationId: invitationId })
                    .then(function (res) {
                    // console.log('edit invitation:', res);
                });
            };
            $scope.startTimeChange = function () {
                sendEditRequest();
            };
            $scope.durationChange = function () {
                sendEditRequest();
            };
            var parseInvitation = function (data) {
                var theme = data.theme;
                var startTime = data.startTime;
                var endTime = data.endTime;
                var minutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
                var hh = Math.floor(minutes / 60);
                var mm = minutes % 60;
                var duration = new Date("2016/1/1 " + hh + ":" + mm + ":0");
                var durationValue = minutes + '';
                return { theme: theme, startTime: startTime, endTime: endTime, duration: duration, data: data, durationValue: durationValue };
            };
            remoteServ.invitationDetail({ invitationId: invitationId })
                .then(function (res) {
                $scope.guestList = res.data.invitedList;
                $scope.invitation = parseInvitation(res.data);
            });
            $scope.cancelInvitation = function () {
                // console.debug('取消会议');
                var cancel = NutModal.show('invitation-edit-cancel');
                $scope.alertCancel = function () {
                    // console.log("取消会议hahah ")
                    cancel();
                };
                $scope.alertOk = function () {
                    remoteServ.cancelInvitation({ invitationId: invitationId })
                        .then(function (res) {
                        $scope.guestList.forEach(function (item) {
                            native.sendIM(item.cloudpId, "\u53D6\u6D88\u4F1A\u5BA2\u9080\u8BF7\u901A\u77E5\uFF1A\u62B1\u6B49\u5DF2\u53D6\u6D88\u539F\u5B9A\u4E8E" + $scope.getStartDate() + "," + $scope.getStartTime() + "\u5F00\u59CB\u7684" + ($scope.invitation.theme || '会客') + "\u9080\u8BF7\u3002");
                        });
                        routeControl.goBack();
                    });
                };
            };
        }
    ]
});
invitation.component(exports.components.invite.name, {
    template: exports.components.invite.template,
    bindings: {},
    controllerAs: 'vm',
    controller: [
        '$scope',
        'ActionSheet',
        '$stateParams',
        sessionModule.serviceName,
        remote_res.serviceName,
        nativeModule.servName,
        'RouteControl',
        function ($scope, ActionSheet, 
            /** 路由参数 */
            $routeParams, sessionServ, remoteServ, native, routeControl) {
            var invitationId = this.invitationId = $routeParams.invitationId;
            $scope.vmrName = sessionServ.myMeetingRoom.name;
            $scope.vmrId = sessionServ.myMeetingRoom.meetingRoomNum;
            $scope.vmrGuestPass = sessionServ.myMeetingRoom.guestPassword;
            $scope.nickname = sessionServ.nickName;
            $scope.handleShareBtnCLick = function (type) {
                share(native, type, {
                    data: {
                        message1: sessionServ.nickName + "\u7279\u9080\u60A8\u52A0\u5165\u6211\u7684\u8D35\u5BBE\u4F1A\u5BA2\u5385\uFF0C\u70B9\u51FB " + (Global.shareUrl + '/invitation.html?invitationId=' + invitationId) + " \u67E5\u770B\u4F1A\u8BAE\u8BE6\u60C5\u3002",
                        message2: sessionServ.nickName + "\u7279\u9080\u60A8\u52A0\u5165\u6211\u7684\u8D35\u5BBE\u4F1A\u5BA2\u5385\uFF0C\u70B9\u51FB " + (Global.shareUrl + '/invitation.html?invitationId=' + invitationId) + " \u67E5\u770B\u4F1A\u8BAE\u8BE6\u60C5\u3002",
                        invitationId: invitationId
                    }
                }, $scope.invitation.theme, Global.shareUrl + '/invitation.html', '', $scope.invitation.theme, $scope.getStartDate() + " " + $scope.getStartTime() + " -" + $scope.getEndTime(), sessionServ.myMeetingRoom.meetingRoomNum + '', sessionServ.myMeetingRoom.guestPassword, $scope.getStartDate() + ' ' + $scope.getEndTime())
                    .then(function (res) {
                    console.log(res);
                    console.log(res.resultCode);
                    if (res.resultCode != 0) {
                        native.messageBox({ title: '提示', content: '分享失败。' });
                    }
                    else {
                        if (res.cloudpIds) {
                            var list = res.cloudpIds;
                            console.debug(list);
                            $scope.guestList = $scope.guestList ? $scope.guestList.concat(list) : list;
                            $scope.guestList = singlefyByCloudpId($scope.guestList);
                            console.log($scope.guestList + "会议邀请时的名单");
                            remoteServ.saveInvitedList(invitationId, $scope.guestList.map(function (x) {
                                return ({
                                    dxtNum: x.cloudpId,
                                    avatar: x.avatar || defaultAvatar,
                                    nickname: x.nickname
                                });
                            }));
                            $scope.guestList.forEach(function (x) {
                                if (!x.avatar) {
                                    x.avatar = defaultAvatar;
                                }
                            });
                        }
                    }
                })
                    .catch(function (res) {
                    console.warn('错误的结果为：', res);
                });
            };
            $scope.invitationTypes = [
                { url: require('../../res/imgs/dxt-logo1.png'), name: '大麦家视宝', type: 'dxt' },
                { url: require('../../res/imgs/qq-logo.png'), name: 'QQ好友', type: 'qq' },
                { url: require('../../res/imgs/wx-logo.png'), name: '微信好友', type: 'wx' },
            ];
            $scope.handleSetupTheme = function () {
                sessionServ.inputPageInvitationTheme = $scope.invitation.theme;
                // console.log($scope.invitation);
            };
            var fixNum = remote_res.fixNum;
            $scope.getStartDate = function () {
                var date = $scope.invitation.startTime || ($scope.invitation.startTime = new Date());
                return fixNum(date.getFullYear()) + "-" + fixNum(date.getMonth() + 1) + "-" + fixNum(date.getDate());
            };
            $scope.getStartTime = function () {
                var time = $scope.invitation.startTime || ($scope.invitation.startTime = new Date());
                return fixNum(time.getHours()) + ":" + fixNum(time.getMinutes());
            };
            $scope.getDuration = function () {
                var time = $scope.invitation.duration || ($scope.invitation.duration = new Date('1970/1/1 1:0:0'));
                return time.getHours() + "\u5C0F\u65F6 " + ((time.getMinutes()) > 0 ? time.getMinutes() + '分钟' : '');
            };
            $scope.getEndTime = function () {
                var durationTime = $scope.invitation.duration || ($scope.invitation.duration = new Date('1970/1/1 1:0:0'));
                var duration = durationTime.getHours() * 60 * 60 * 1000 + durationTime.getMinutes() * 60 * 1000;
                var endTime = new Date($scope.invitation.startTime.getTime() + duration);
                return fixNum(endTime.getHours()) + ":" + fixNum(endTime.getMinutes());
            };
            $scope.transTimeStamp = function (date) {
                console.log(date, "chuanguolai");
                var data = (new Date(date).getTime()) / 1000;
                // return data.toString();
                return data + '';
            };
            var sendEditRequest = function () {
                var invitation = $scope.invitation;
                var theme = invitation.theme;
                var _startTime = invitation.startTime;
                var _duration = invitation.duration;
                var durationValue = invitation.durationValue;
                var startTime = remote_res.toServerDateString(_startTime);
                var hh = _duration.getHours();
                var mm = _duration.getMinutes();
                var sss = hh * 60 * 60 * 1000 + mm * 60 * 1000;
                // let _endTime = new Date(_startTime.getTime() + sss);
                var _endTime = new Date(_startTime.getTime() + parseInt(durationValue) * 60 * 1000);
                var endTime = remote_res.toServerDateString(_endTime);
                if (_startTime.getTime() < Date.now()) {
                    native.messageBox({ title: '注意', content: '您选择的会议开始时间早于当前时间。' });
                    // return;
                }
                remoteServ.editInvitation({ theme: theme, startTime: startTime, endTime: endTime }, { invitationId: invitationId })
                    .then(function (res) {
                    // console.log('edit invitation:', res);
                });
            };
            $scope.startTimeChange = function () {
                sendEditRequest();
            };
            $scope.durationChange = function () {
                sendEditRequest();
            };
            var parseInvitation = function (data) {
                var theme = data.theme;
                var startTime = data.startTime;
                var endTime = data.endTime;
                var minutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
                var hh = Math.floor(minutes / 60);
                var mm = minutes % 60;
                var duration = new Date("2016/1/1 " + hh + ":" + mm + ":0");
                var durationValue = minutes + '';
                console.log(durationValue + "chixushijian");
                return { theme: theme, startTime: startTime, endTime: endTime, duration: duration, data: data, durationValue: durationValue };
            };
            remoteServ.invitationDetail({ invitationId: invitationId })
                .then(function (res) {
                $scope.invitation = parseInvitation(res.data);
            });
            $scope.cancelInvitation = function () {
                remoteServ.cancelInvitation({ invitationId: invitationId })
                    .then(function (res) {
                    routeControl.goBack();
                });
            };
        }
    ]
});
//路由的配置
invitation.config([
    '$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state(exports.components.create.name, {
            url: '/invitation/create',
            component: exports.components.create.name
        })
            .state(exports.components.detail.name, {
            url: '/invitation/detail',
            component: exports.components.detail.name
        })
            .state(exports.components.setupTheme.name, {
            url: '/invitation/setup-theme',
            component: exports.components.setupTheme.name
        })
            .state(exports.components.setupTheme.name + '_save', {
            url: '/invitation/setup-theme/:invitationId',
            component: exports.components.setupTheme.name
        })
            .state(exports.components.edit.name, {
            url: '/invitation/edit/:invitationId',
            component: exports.components.edit.name
        })
            .state(exports.components.invite.name, {
            url: '/invitation/invite/:invitationId',
            component: exports.components.invite.name
        });
    }
]);
//# sourceMappingURL=invitation.js.map