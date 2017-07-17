"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var remote_res = require("../../common/remote_resource");
require('./my_meeting_room_style');
var angular = require("angular");
var actionSheet = require("../../components/nut-action-sheet");
var session = require("../../common/models/session");
exports.name = 'me.pages.myMeetingRoom';
exports.components = {
    index: {
        name: "meetingRoomIndex",
        template: require('./index.tmpl.new.html')
    },
    create: {
        name: "meetingRoomCreate",
        template: require('./create.tmpl.html')
    },
    createSuccess: {
        name: "meetingRoomCreateSuccess",
        template: require('./createSuccess.tmpl.html')
    },
    meetingTime: {
        name: "meetingRoomMeetingTime",
        template: require('./meetingTime.tmpl.html')
    },
    meetingDetails: {
        name: "meetingRoomMeetingDetails",
        template: require('./meetingDetails.tmpl.html')
    },
    rechargeDetails: {
        name: "meetingRoomRechargeDetails",
        template: require('./rechargeDetails.tmpl.html')
    },
    presentDetails: {
        name: "meetingRoomPresentDetails",
        template: require('./presentDetails.tmpl.html')
    },
    invalidDetails: {
        name: "meetingRoomInvalidDetails",
        template: require('./invalidDetails.tmpl.html')
    },
    setup_index: {
        name: "meetingRoomSetupIndex",
        template: require('./setup_meeting_room/index.tmpl.html')
    },
    setup_hostpass: {
        name: "meetingRoomSetupHostpass",
        template: require('./setup_meeting_room/host_password.tmpl.html')
    },
    setup_guestpass: {
        name: "meetingRoomSetupGuestpass",
        template: require('./setup_meeting_room/guest_password.tmpl.html')
    },
    setup_help: {
        name: "meetingRoomSetupHelp",
        template: require('./setup_meeting_room/help.tmpl.html')
    },
    setup_name: {
        name: "meetingRoomSetupName",
        template: require('./setup_meeting_room/name.tmpl.html')
    },
    setup_meetingname: {
        name: "meetingRoomSetupMeetingname",
        template: require('./setup_meeting_room/meetingname.tmpl.html')
    },
};
var meetingRoom = angular.module(exports.name, []);
/**
 * 我的会议室-主页
 */
meetingRoom.component(exports.components.index.name, {
    template: exports.components.index.template,
    controller: [
        '$state', '$scope', '$rootScope', session.serviceName, remote_res.serviceName, 'NativeApi', 'NutModal',
        function ($state, $scope, $rootScope, sessionServ, remoteServ, native, NutModal) {
            // 界面显示的绑定
            $scope.meetingRoomNum = function () { return sessionServ.myMeetingRoom.meetingRoomNum; };
            $scope.meetingRoomName = function () { return sessionServ.myMeetingRoom.name; };
            sessionServ.remainTime = null;
            $scope.remainTime = function () {
                if (sessionServ.myMeetingRoom.remainTime > 0) {
                    return Math.floor(sessionServ.myMeetingRoom.remainTime / 60);
                }
                else {
                    return 0 - Math.floor(Math.abs(sessionServ.myMeetingRoom.remainTime) / 60);
                }
            };
            var vm = $scope.vm = {
                alertRemainTimeLow: false
            };
            $scope.handleCreateInvitation = function () {
                sessionServ.inputPageInvitationTheme = ''; // '请输入会议主题';
            };
            // 获取会议室的信息
            remoteServ
                .getMeetingRoomInfo()
                .then(function (res) {
                if (res.code === '0') {
                    sessionServ.myMeetingRoom = res.data[res.data.length - 1];
                }
            });
            // 获取账户信息
            remoteServ.getAccountInfo()
                .then(function (res) {
                if (res.code === '0') {
                    sessionServ.nickName = res.data.nickname;
                    sessionServ.remainTime = res.data.remainTime;
                }
            });
            /**
             * 把 invitationRecord 转换成更加适合显示的对象
             */
            var parseRecord = function (record) {
                var fixNum = remote_res.fixNum;
                var _timeleft = function () { return record.startTime.getTime() - Date.now(); };
                var timeleft = {
                    hour: function () { return fixNum(Math.floor(_timeleft() / 1000 / 60 / 60)); },
                    second: function () { return fixNum(Math.floor((_timeleft() % 3600000) / 1000 / 60) + 1); }
                };
                var date = fixNum(record.startTime.getMonth() + 1) + "-" + fixNum(record.startTime.getDate());
                var startTime = fixNum(record.startTime.getHours()) + ":" + fixNum(record.startTime.getMinutes());
                var endTime = fixNum(record.endTime.getHours()) + ":" + fixNum(record.endTime.getMinutes());
                var theme = record.theme;
                var tip = date;
                var today = new Date(record.startTime.getFullYear() + "-" + date);
                var computedTimeleft = record.startTime.getTime() - today.getTime();
                if (computedTimeleft < 24 * 3 * 60 * 60 * 1000) {
                    tip = '后天';
                    if (computedTimeleft < 24 * 2 * 60 * 60 * 1000) {
                        tip = '明天';
                        if (computedTimeleft < 24 * 1 * 60 * 60 * 1000) {
                            tip = '今天';
                        }
                    }
                }
                tip = remote_res.getFixedDateStr(record.startTime);
                date = remote_res.getFixedDateStr(record.startTime);
                return { timeleft: timeleft, date: date, startTime: startTime, endTime: endTime, theme: theme, tip: tip, record: record, alreadyStart: function () { return _timeleft() < 0; } };
            };
            /**
             * 在作用域上存储邀请列表相关的信息
             */
            var invitationRecords = window['records'] = $scope.invitationRecords = {
                head: {},
                list: [],
                total: 0,
                size: 10,
                page: 0,
                hasNext: function () { return true; }
            };
            // 加载界面的同时立刻获取邀请列表前十项
            remoteServ
                .invitationRecord({ start: 1, size: invitationRecords.size })
                .then(function (res) {
                invitationRecords.total = res.data.totalSize;
                if (res.data.resultList.length > 0) {
                    invitationRecords.head = parseRecord(res.data.resultList[0]);
                    invitationRecords.list = res.data.resultList.slice(1).map(function (record) { return parseRecord(record); });
                    invitationRecords.page = 1;
                    invitationRecords.hasNext = function () { return res.data.totalSize > 10; };
                }
            })
                .catch(function (error) {
                if (error.code && error.msg) {
                    // console.log(error);
                }
            });
            // 用户行为
            var actions = $scope.actions = {
                // 点击设置按钮
                handleSettingBtnClick: function () {
                    $state.go(exports.components.setup_index.name);
                },
                // 上拉加载更多事件处理
                handleLoadMore: function () {
                    invitationRecords.hasNext = function () { return invitationRecords.total > invitationRecords.page * invitationRecords.size; };
                    if (invitationRecords.total > invitationRecords.page * invitationRecords.size) {
                        remoteServ
                            .invitationRecord({ start: ++invitationRecords.page, size: invitationRecords.size })
                            .then(function (res) {
                            invitationRecords.total = res.data.totalSize;
                            invitationRecords.list = invitationRecords.list.concat(res.data.resultList.slice(1).map(function (record) { return parseRecord(record); }));
                        });
                    }
                    else {
                        // invitationRecords.hasNext =()=> false;
                    }
                },
                handleInvitationRecordClick: function (record) {
                    $state.go('invitationEdit', { invitationId: record.invitationId });
                    document.body.scrollTop = 0;
                },
                //进入我的会客厅
                enterMyMeetingRoom: function () {
                    var lastTime = new Date();
                    console.log('Enter my room!');
                    if (sessionServ.myMeetingRoom.remainTime < 60) {
                        vm.closeAlert = NutModal.show('index-remain-time-low');
                        // native.messageBox({ title: '提示', content: '您没有足够的剩余时长进入会议室，请前往充值。' });
                        return;
                    }
                    var request = {
                        nickname: sessionServ.myMeetingRoom.nickName,
                        password: sessionServ.myMeetingRoom.hostPassword,
                        conference_no: sessionServ.myMeetingRoom.meetingRoomNum,
                        microphone_status: true,
                        invited_password: sessionServ.myMeetingRoom.guestPassword,
                        domain: '',
                        camera_status: true
                    };
                    console.log('enter my meeting room:', request);
                    native.joinConference(request)
                        .then(function (res) {
                        if (res.resultCode === "0") {
                            $state.go("meetingRoomIndex");
                            setTimeout(function () {
                                remoteServ.getAccountInfo()
                                    .then(function (res) {
                                    if (res.code === '0') {
                                        sessionServ.nickName = res.data.nickname;
                                        // sessionServ.remainTime = res.data.remainTime;
                                        sessionServ.myMeetingRoom.remainTime = res.data.remainTime;
                                    }
                                });
                            }, 1000);
                        }
                    });
                }
            };
        }
    ]
});
/*
 * 开通我的会议室
 */
meetingRoom.component(exports.components.create.name, {
    template: exports.components.create.template,
    controller: ['RouteControl', '$state', '$scope', '$rootScope', 'ActionSheet', remote_res.serviceName, 'NutModal', session.serviceName,
        function (RouteControl, $state, $scope, $rootScope, ActionSheet, remote, NutModal, session) {
            /**
             * swiper显示bug处理
             */
            var swiperFix = function () {
                var elements = document.querySelectorAll('.swiper-pagination');
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i];
                    if (el.id != '') {
                        el.style.display = 'none';
                    }
                }
            };
            setTimeout(swiperFix, 100);
            // 检查是否开通过，是则跳转到主页面
            remote
                .login({ openId: session.openid, channel: '电信通' })
                .then(function (res) {
                if (res.data.status != 0) {
                    remote.getMeetingRoomInfo()
                        .then(function (res) {
                        if (res && res.code !== '38') {
                            $state.go(exports.components.index.name);
                            RouteControl.popThis();
                        }
                    });
                }
            });
            $rootScope.isActive = true;
            $scope.swipers = [
                { url: require('../../res/imgs/create-swiper1.png'), inst: '全球高清无延迟会客厅' },
                { url: require('../../res/imgs/create-swiper2.png'), inst: '免费开通，永久有效' },
                { url: require('../../res/imgs/create-swiper3.png'), inst: '支持10人同时访问' },
                { url: require('../../res/imgs/create-swiper4.png'), inst: '支持多终端来访' },
            ];
            $scope.bottom = { bottomlogoImg: require('../../res/imgs/bottom-logo.png') };
            /**
             * 是否显示“创建成功”对话框
             */
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = false;
            $scope.waiting = false;
            $scope.create = function () {
                if ($scope.waiting) {
                    return;
                }
                var is2p3uper = false;
                try {
                    dxtApp.getVersion(function (a) {
                        if (parseFloat(a.version.slice(1, 4)) >= 2.3) {
                            is2p3uper = true;
                        }
                        else {
                            is2p3uper = false;
                        }
                    });
                }
                catch (e) {
                }
                setTimeout(function () {
                    if (session.isBindMobile || !is2p3uper) {
                        $state.go('meetingRoomCreateSuccess');
                    }
                    else {
                        var closeModal_1 = NutModal.show('create-meetingroom-failure');
                        $scope.handleBindCancelButtonClicked = function () {
                            closeModal_1();
                        };
                        $scope.handleBindButtonClicked = function () {
                            // 调用原生界面让用户去绑定手机号
                            console.debug('调用原生界面让用户去绑定手机号');
                            try {
                                dxtApp.bindMobile(function (res) {
                                    console.debug(res);
                                    if (res.resultCode === '0') {
                                        session.isBindMobile = true;
                                    }
                                    closeModal_1();
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        };
                    }
                }, 100);
            };
            $scope.gotoHelpPage = function () {
                $state.go('meetingRoomSetupHelp');
            };
            // 点击右上角按钮触发的回调函数
            $scope.log = function () {
                var btns = [];
                btns.push(new actionSheet.ActionSheetButton('取消会议1', ['btn-default'], function () {
                    // console.log('取消会议1')
                }));
                btns.push(new actionSheet.ActionSheetButton('取消会议2', ['btn-alert'], function () {
                    // console.log('取消会议2')
                }));
                btns.push(new actionSheet.ActionSheetButton('取消会议3', ['btn-alert'], function () {
                    // console.log('取消会议3')
                }));
                ActionSheet.show(btns, function () {
                    // console.log('action sheet has been closed')
                });
            };
        }]
});
/*
* 开通我的会议室成功
*/
meetingRoom.component(exports.components.createSuccess.name, {
    template: exports.components.createSuccess.template,
    controller: ['RouteControl', '$state', '$scope', '$rootScope', 'ActionSheet', remote_res.serviceName, session.serviceName,
        function (RouteControl, $state, $scope, $rootScope, ActionSheet, remote, session) {
            $scope.waiting = true;
            remote
                .createMeetingRoom()
                .then(function (res) {
                $scope.waiting = true;
                // console.log(res);
                if (res.code && res.message) {
                    switch (res.code) {
                        case '0':
                            $scope.data = {
                                num: res.data.meetingRoomNum,
                                remainTime: Math.floor(res.data.remainTime / 60),
                            };
                            break;
                        case '28':
                        default:
                            alert("\u53D1\u751F\u9519\u8BEF\uFF1A" + JSON.stringify(res));
                            break;
                    }
                }
                return remote.getMeetingRoomInfo();
            })
                .then(function (res) {
                $scope.handleOKButtonClicked = function () {
                    RouteControl.popThis();
                    $state.go('meetingRoomIndex');
                };
            });
        }]
});
/**
 * 充值/使用信息列表页
 */
meetingRoom.component(exports.components.meetingTime.name, {
    template: exports.components.meetingTime.template,
    controller: ['$scope', session.serviceName, remote_res.serviceName,
        function ($scope, sessionServ, remoteServ) {
            var data = $scope.data = {};
            data.remainTime = function () {
                return Math.floor(sessionServ.myMeetingRoom.remainTime / 60);
            };
            data.timeBillList = [];
            var pageNow = 0;
            var size = 20;
            var totalSize = 20;
            var getList = function (start, size) { return remoteServ.vmrTimeBill({ start: start, size: size })
                .then(function (res) {
                totalSize = res.data.totalSize;
                data.hasNextpage = totalSize > pageNow * size;
                data.timeBillList = data.timeBillList.concat(res.data.resultList.map(function (timeBill) {
                    var name, date, time, dt, type = timeBill.type, id;
                    var getDate = function (dateStr) {
                        var date = new Date(dateStr);
                        var month = date.getMonth() + 1;
                        var day = date.getDate();
                        return remote_res.getFixedDateStr(date); //remote_res.fixNum(month) + '-' + remote_res.fixNum(day);
                    };
                    var getTime = function (dateStr) {
                        var date = new Date(dateStr);
                        var hours = date.getHours();
                        var minutes = date.getMinutes();
                        return remote_res.fixNum(hours) + ':' + remote_res.fixNum(minutes);
                    };
                    switch (timeBill.type) {
                        case 1:
                            name = timeBill.scheduleName; //时长消耗类型名称（v2.5的需要包括：充值、活动赠送、失效（充值失效和活动赠送失效、会客）
                            date = getDate(timeBill.startTime);
                            time = getTime(timeBill.startTime) + "-" + getTime(timeBill.endTime);
                            dt = Math.round(timeBill.duration / 60);
                            id = timeBill.id;
                            break;
                        case 2:
                            name = timeBill.scheduleName;
                            date = getDate(timeBill.startTime);
                            time = "" + getTime(timeBill.startTime);
                            dt = Math.round(timeBill.duration / 60);
                            id = timeBill.id;
                            break;
                        case 3:
                            name = timeBill.scheduleName;
                            date = getDate(timeBill.startTime);
                            time = "" + getTime(timeBill.startTime);
                            dt = Math.round(timeBill.duration / 60);
                            id = timeBill.id;
                            break;
                        case 4:
                            name = timeBill.scheduleName;
                            date = getDate(timeBill.startTime);
                            time = "" + getTime(timeBill.startTime);
                            dt = Math.round(timeBill.duration / 60);
                            id = timeBill.id;
                            break;
                    }
                    return { name: name, date: date, time: time, dt: dt, type: type, id: id };
                }));
            }); };
            // getList(pageNow, size);
            data.hasNextpage = true;
            $scope.getMore = function () {
                if (totalSize > pageNow * size) {
                    getList(++pageNow, size);
                }
                else {
                    data.hasNextpage = false;
                }
            };
        }]
});
meetingRoom.component(exports.components.meetingDetails.name, {
    template: exports.components.meetingDetails.template,
    controller: ['$scope', '$stateParams', remote_res.serviceName, session.serviceName,
        function ($scope, $stateParams, remoteServ, sessionServ) {
            remoteServ.useSchedule({ id: $stateParams.id })
                .then(function (res) {
                var list = res.data.participantsList;
                list.forEach(function (item) {
                    item.duration = Math.round(item.duration / 60);
                });
                var amount = res.data.participantsAmount;
                var theme = res.data.theme;
                var meetingRoomNum = res.data.meetingRoomNum;
                var duration = Math.round(res.data.duration / 60);
                var startTime = new Date(res.data.startTime);
                var endTime = new Date(res.data.endTime);
                var time = remote_res.fixNum(startTime.getFullYear()) + '-' + remote_res.fixNum(startTime.getMonth() + 1) + '-' + remote_res.fixNum(startTime.getDate())
                    + ' ' + remote_res.fixNum(startTime.getHours()) + ':' + remote_res.fixNum(startTime.getMinutes()) + '-' + remote_res.fixNum(endTime.getHours()) + ':' + remote_res.fixNum(endTime.getMinutes());
                $scope.data = { list: list, amount: amount, theme: theme, meetingRoomNum: meetingRoomNum, duration: duration, time: time };
                $scope.totalDuration = list.reduce(function (pv, nv) { return pv + nv.duration; }, 0);
            });
        }]
});
meetingRoom.component(exports.components.rechargeDetails.name, {
    template: exports.components.rechargeDetails.template,
    controller: ['$scope', '$stateParams', remote_res.serviceName,
        function ($scope, $stateParams, remoteServ) {
            var id = $stateParams.id;
            remoteServ.recharge({ id: id })
                .then(function (res) {
                var data = res.data;
                var meetingRoomNum = data.meetingRoomNum;
                var createTime = new Date(data.createTime);
                var valid;
                if (data.expirationTime == null) {
                    valid = "永久有效";
                }
                else {
                    var expirationTime = new Date(data.expirationTime.replace(/\-/g, '/'));
                    valid = remote_res.fixNum(expirationTime.getFullYear()) + '-' + remote_res.fixNum(expirationTime.getMonth() + 1) + '-' + remote_res.fixNum(expirationTime.getDate());
                }
                var time = remote_res.fixNum(createTime.getFullYear()) + '-' + remote_res.fixNum(createTime.getMonth() + 1) + '-' + remote_res.fixNum(createTime.getDate())
                    + ' ' + remote_res.fixNum(createTime.getHours()) + ':' + remote_res.fixNum(createTime.getMinutes());
                var money = data.money;
                var duration = Math.round(data.duration / 60);
                $scope.data = { createTime: createTime, time: time, valid: valid, meetingRoomNum: meetingRoomNum, money: money, duration: duration, data: data };
            });
        }]
});
meetingRoom.component(exports.components.presentDetails.name, {
    template: exports.components.presentDetails.template,
    controller: ['$scope', '$stateParams', remote_res.serviceName,
        function ($scope, $stateParams, remoteServ) {
            var id = $stateParams.id;
            remoteServ.recharge({ id: id })
                .then(function (res) {
                var data = res.data;
                var meetingRoomNum = data.meetingRoomNum;
                var createTime = new Date(data.createTime);
                var valid;
                if (data.expirationTime == null) {
                    valid = "永久有效";
                }
                else {
                    var expirationTime = new Date(data.expirationTime.replace(/\-/g, '/'));
                    valid = remote_res.fixNum(expirationTime.getFullYear()) + '-' + remote_res.fixNum(expirationTime.getMonth() + 1) + '-' + remote_res.fixNum(expirationTime.getDate());
                }
                var time = remote_res.fixNum(createTime.getFullYear()) + '-' + remote_res.fixNum(createTime.getMonth() + 1) + '-' + remote_res.fixNum(createTime.getDate())
                    + ' ' + remote_res.fixNum(createTime.getHours()) + ':' + remote_res.fixNum(createTime.getMinutes());
                var money = data.money;
                var duration = Math.round(data.duration / 60);
                $scope.data = { createTime: createTime, time: time, valid: valid, meetingRoomNum: meetingRoomNum, money: money, duration: duration, data: data };
            });
        }]
});
meetingRoom.component(exports.components.invalidDetails.name, {
    template: exports.components.invalidDetails.template,
    controller: ['$scope', '$stateParams', remote_res.serviceName,
        function ($scope, $stateParams, remoteServ) {
            var id = $stateParams.id;
            remoteServ.recharge({ id: id })
                .then(function (res) {
                var data = res.data;
                var meetingRoomNum = data.meetingRoomNum;
                var createTime = new Date(data.createTime);
                var expirationTime = new Date(data.expirationTime.replace(/\-/g, '/'));
                var time = remote_res.fixNum(createTime.getFullYear()) + '-' + remote_res.fixNum(createTime.getMonth() + 1) + '-' + remote_res.fixNum(createTime.getDate())
                    + ' ' + remote_res.fixNum(createTime.getHours()) + ':' + remote_res.fixNum(createTime.getMinutes());
                var valid = remote_res.fixNum(expirationTime.getFullYear()) + '-' + remote_res.fixNum(expirationTime.getMonth() + 1) + '-' + remote_res.fixNum(expirationTime.getDate());
                var money = data.money;
                var duration = Math.round(data.duration / 60);
                $scope.data = { createTime: createTime, time: time, valid: valid, meetingRoomNum: meetingRoomNum, money: money, duration: duration, data: data };
            });
        }]
});
meetingRoom.component(exports.components.setup_index.name, {
    template: exports.components.setup_index.template,
    controller: [
        '$scope', remote_res.serviceName, session.serviceName,
        function ($scope, remoteServ, sessionServ) {
            $scope.nickname = sessionServ.nickName;
            remoteServ.getMeetingRoomInfo()
                .then(function (res) {
                var target = res.data[res.data.length - 1];
                sessionServ.myMeetingRoom = target;
                $scope.meetingRoom = target;
            });
        }
    ]
});
/**
 * 设置主持人密码
 */
meetingRoom.component(exports.components.setup_hostpass.name, {
    template: exports.components.setup_hostpass.template,
    controller: [
        '$scope', session.serviceName, remote_res.serviceName, 'RouteControl', '$timeout',
        function ($scope, sessionServ, // 会话数据
            remoteServ, // 网络访问层
            RouteControl, // 路由控制服务：回退
            $timeout) {
            // TODO: 参考
            $scope.showMsg = false;
            $scope.myMeetingRoom = angular.merge({}, sessionServ.myMeetingRoom);
            $scope.save = function () {
                var hostPass = $scope.myMeetingRoom.hostPassword;
                var canSetup = true;
                var num = 0;
                canSetup = canSetup && ((/^\d{6}$/.test(hostPass)) || (hostPass == ''));
                canSetup ? num = 0 : num++;
                canSetup = canSetup && ($scope.myMeetingRoom.hostPassword != $scope.myMeetingRoom.guestPassword);
                canSetup ? num = 0 : num++;
                if (canSetup) {
                    remoteServ.editMeetingRoom($scope.myMeetingRoom)
                        .then(function (result) {
                        if (result.code == '0') {
                            // console.log('保存成功');
                            return remoteServ.getMeetingRoomInfo();
                        }
                        else {
                            $scope.errorMsg = '保存失败';
                            $scope.showMsg = true;
                            $timeout(function () {
                                $scope.showMsg = false;
                            }, 2000);
                            return remoteServ.getMeetingRoomInfo();
                        }
                    })
                        .then(function (result) {
                        var target = result.data[result.data.length - 1];
                        sessionServ.myMeetingRoom = target;
                        // 回退到上一页
                        RouteControl.goBack();
                    })
                        .catch(function (reason) {
                        $scope.errorMsg = '网络出现问题，请稍后重新保存！';
                        $scope.showMsg = true;
                        $timeout(function () {
                            $scope.showMsg = false;
                        }, 2000);
                    });
                }
                else {
                    if (num == 1) {
                        $scope.errorMsg = '主持人密码不能与入会密码一致！';
                        $scope.showMsg = true;
                        $timeout(function () {
                            $scope.showMsg = false;
                        }, 2000);
                    }
                    else if (num == 2) {
                        $scope.errorMsg = '输入格式不正确！';
                        $scope.showMsg = true;
                        $timeout(function () {
                            $scope.showMsg = false;
                        }, 2000);
                    }
                }
            };
        }
    ]
});
/**
 * 设置入会密码
 */
meetingRoom.component(exports.components.setup_guestpass.name, {
    template: exports.components.setup_guestpass.template,
    controller: [
        '$scope', session.serviceName, remote_res.serviceName, 'RouteControl', '$timeout',
        function ($scope, sessionServ, remoteServ, RouteControl, $timeout) {
            $scope.showMsg = false;
            $scope.myMeetingRoom = angular.merge({}, sessionServ.myMeetingRoom);
            $scope.save = function () {
                var guestPassword = $scope.myMeetingRoom.guestPassword;
                var canSetup = true;
                var num = 0;
                canSetup = canSetup && ((/^\d{6}$/.test(guestPassword)) || (guestPassword == ''));
                canSetup ? num = 0 : num++;
                canSetup = canSetup && ($scope.myMeetingRoom.hostPassword != $scope.myMeetingRoom.guestPassword);
                canSetup ? num = 0 : num++;
                if (canSetup) {
                    remoteServ.editMeetingRoom($scope.myMeetingRoom)
                        .then(function (result) {
                        if (result.code == '0') {
                            // console.log('保存成功');
                            return remoteServ.getMeetingRoomInfo();
                        }
                        else {
                            $scope.errorMsg = '保存失败';
                            $scope.showMsg = true;
                            $timeout(function () {
                                $scope.showMsg = false;
                            }, 2000);
                            return remoteServ.getMeetingRoomInfo();
                        }
                    })
                        .then(function (result) {
                        var target = result.data[result.data.length - 1];
                        sessionServ.myMeetingRoom = target;
                        RouteControl.goBack();
                    })
                        .catch(function (reason) {
                        $scope.errorMsg = '网络出现问题，请稍后重新保存！';
                        $scope.showMsg = true;
                        $timeout(function () {
                            $scope.showMsg = false;
                        }, 2000);
                    });
                }
                else {
                    if (num == 1) {
                        $scope.errorMsg = '入会密码不能与主持人密码一致！';
                        $scope.showMsg = true;
                        $timeout(function () {
                            $scope.showMsg = false;
                        }, 2000);
                    }
                    else if (num == 2) {
                        $scope.errorMsg = '密码输入格式不正确！';
                        $scope.showMsg = true;
                        $timeout(function () {
                            $scope.showMsg = false;
                        }, 2000);
                    }
                }
            };
        }
    ]
});
/**
 * 设置会议室的名字
 */
meetingRoom.component(exports.components.setup_name.name, {
    template: exports.components.setup_name.template,
    controller: [
        '$scope', session.serviceName, remote_res.serviceName, 'RouteControl',
        function ($scope, sessionServ, remoteServ, RouteControl) {
            $scope.myMeetingRoom = angular.merge({}, sessionServ.myMeetingRoom);
            $scope.save = function () {
                remoteServ.editMeetingRoom($scope.myMeetingRoom)
                    .then(function (result) {
                    if (result.code == '0') {
                        // console.log('保存成功');
                        return remoteServ.getMeetingRoomInfo();
                    }
                    else {
                        // console.log('保存失败');
                        return remoteServ.getMeetingRoomInfo();
                    }
                })
                    .then(function (result) {
                    var target = result.data[result.data.length - 1];
                    sessionServ.myMeetingRoom = target;
                    RouteControl.goBack();
                });
            };
        }
    ]
});
/**
 * 设置“昵称”
 */
meetingRoom.component(exports.components.setup_meetingname.name, {
    template: exports.components.setup_meetingname.template,
    controller: [
        '$scope', session.serviceName, remote_res.serviceName, 'RouteControl',
        function ($scope, sessionServ, remoteServ, RouteControl) {
            $scope.myMeetingRoom = angular.merge({}, sessionServ.myMeetingRoom);
            $scope.save = function () {
                remoteServ.editMeetingRoom($scope.myMeetingRoom)
                    .then(function (result) {
                    if (result.code == '0') {
                        // console.log('保存成功');
                        return remoteServ.getMeetingRoomInfo();
                    }
                    else {
                        // console.log('保存失败');
                        return remoteServ.getMeetingRoomInfo();
                    }
                })
                    .then(function (result) {
                    var target = result.data[result.data.length - 1];
                    sessionServ.myMeetingRoom = target;
                    RouteControl.goBack();
                });
            };
        }
    ]
});
meetingRoom.component(exports.components.setup_help.name, {
    template: exports.components.setup_help.template,
    controller: ['$scope', function ($scope) {
        }]
});
meetingRoom.component('test', {
    template: require('./test.tmpl.html'),
    controllerAs: 'vm',
    controller: ['NativeApi', function (native) {
            var _this = this;
            this.getNetworkType = function () { return native.getNetworkType().then(function (res) { return _this.msg = 'networktype: ' + JSON.stringify(res); }); };
            this.messageBox = function () { return native.messageBox({ title: 'hello', content: 'world' })
                .then(function (res) { return _this.msg = 'msgbox: ' + JSON.stringify(res); }); };
            this.data = [
                { title: 'item1', value: 1 },
                { title: 'item2', value: 2 },
                { title: 'item3', value: 3 },
                { title: 'item4', value: 4 },
                { title: 'item5', value: 5 },
                { title: 'item6', value: 6 },
                { title: 'item7', value: 7 },
                { title: 'item8', value: 8 },
                { title: 'item9', value: 9 },
                { title: 'item10', value: 10 },
                { title: 'item11', value: 11 },
                { title: 'item12', value: 12 },
                { title: 'item13', value: 13 },
                { title: 'item14', value: 14 },
                { title: 'item15', value: 15 },
                { title: 'item16', value: 16 },
                { title: 'item17', value: 17 },
                { title: 'item18', value: 18 },
                { title: 'item19', value: 19 },
                { title: 'item20', value: 20 },
                { title: 'item21', value: 21 },
                { title: 'item22', value: 22 },
                { title: 'item23', value: 23 },
            ];
            this.index = 13;
        }]
});
meetingRoom.config([
    '$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state({
            name: 'test',
            url: '/test',
            component: 'test'
        })
            .state({
            name: exports.components.index.name,
            url: '/my-meeting-room/index',
            component: exports.components.index.name
        })
            .state({
            name: exports.components.create.name,
            url: '/my-meeting-room/create',
            component: exports.components.create.name
        })
            .state({
            name: exports.components.createSuccess.name,
            url: '/my-meeting-room/createSuccess',
            component: exports.components.createSuccess.name
        })
            .state({
            name: exports.components.meetingTime.name,
            url: '/my-meeting-room/meeting-time',
            component: exports.components.meetingTime.name
        })
            .state({
            name: exports.components.meetingDetails.name,
            url: '/my-meeting-room/meeting-details/:id',
            component: exports.components.meetingDetails.name
        })
            .state({
            name: exports.components.rechargeDetails.name,
            url: '/my-meeting-room/recharge-details/:id',
            component: exports.components.rechargeDetails.name
        })
            .state({
            name: exports.components.presentDetails.name,
            url: '/my-meeting-room/present-details/:id',
            component: exports.components.presentDetails.name
        })
            .state({
            name: exports.components.invalidDetails.name,
            url: '/my-meeting-room/invalid-details/:id',
            component: exports.components.invalidDetails.name
        })
            .state({
            name: exports.components.setup_guestpass.name,
            url: '/my-meeting-room/setup_meeting_room/guest-password',
            component: exports.components.setup_guestpass.name
        })
            .state({
            name: exports.components.setup_hostpass.name,
            url: '/my-meeting-room/setup_meeting_room/host-password',
            component: exports.components.setup_hostpass.name
        })
            .state({
            name: exports.components.setup_index.name,
            url: '/my-meeting-room/setup_meeting_room/index',
            component: exports.components.setup_index.name
        })
            .state({
            name: exports.components.setup_help.name,
            url: '/my-meeting-room/setup_meeting_room/help',
            component: exports.components.setup_help.name
        })
            .state({
            name: exports.components.setup_name.name,
            url: '/my-meeting-room/setup_meeting_room/name',
            component: exports.components.setup_name.name
        })
            .state({
            name: exports.components.setup_meetingname.name,
            url: '/my-meeting-room/setup_meeting_room/meetingname',
            component: exports.components.setup_meetingname.name
        });
    }
]);
//# sourceMappingURL=my_meeting_room.js.map