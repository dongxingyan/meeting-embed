import * as remote_res from "../../common/remote_resource";
declare let require; // 为webpack的require语法所做的特殊声明
declare let dxtApp;
require('./my_meeting_room_style');

import * as angular from 'angular';
import * as router from 'angular-ui-router';
import * as actionSheet from '../../components/nut-action-sheet'
import * as session from "../../common/models/session";
import { IMeetingRoom, IGetMeetingRoomResponse } from '../../common/models/basic/IGetMeetingRoomInfo';
import { SessionService } from "../../common/models/session";
import { RemoteResourceService } from "../../common/remote_resource";
import { NativeApiService } from "../../common/nativeApi";
import * as angualr from 'angular';


export let name = 'me.pages.myMeetingRoom';
export let components = {
    index: {
        name: "meetingRoomIndex",
        template: require('./index.tmpl.new.html')
    },
    create: {
        name: "meetingRoomCreate",
        template: require('./create.tmpl.html')
    },
    createSuccess:{
        name:"meetingRoomCreateSuccess",
        template:require('./createSuccess.tmpl.html')
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

let meetingRoom = angular.module(name, []);
/**
 * 我的会议室-主页
 */
meetingRoom.component(components.index.name, {
    template: components.index.template,
    controller: [
        '$state', '$scope', '$rootScope', session.serviceName, remote_res.serviceName, 'NativeApi', 'NutModal',
        function ($state: router.StateService,
            $scope, $rootScope,
            sessionServ: session.SessionService,
            remoteServ: remote_res.RemoteResourceService,
            native: NativeApiService,
            NutModal) {
            // 界面显示的绑定
            $scope.meetingRoomNum = () => sessionServ.myMeetingRoom.meetingRoomNum;
            $scope.meetingRoomName = () => sessionServ.myMeetingRoom.name;
            sessionServ.remainTime = null;
            $scope.remainTime = () => {
                if (sessionServ.myMeetingRoom.remainTime > 0) {
                    return Math.floor(sessionServ.myMeetingRoom.remainTime / 60);
                }
                else {
                    return 0 - Math.floor(Math.abs(sessionServ.myMeetingRoom.remainTime) / 60);
                }
            };

            let vm: any = $scope.vm = {
                alertRemainTimeLow: false
            };
            $scope.handleCreateInvitation = () => {
                sessionServ.inputPageInvitationTheme = '';// '请输入会议主题';
            };

            // 获取会议室的信息
            remoteServ
                .getMeetingRoomInfo()
                .then(res => {
                    if (res.code === '0') {
                        sessionServ.myMeetingRoom = res.data[res.data.length - 1];
                    }
                });
            // 获取账户信息
            remoteServ.getAccountInfo()
                .then(res => {
                    if (res.code === '0') {
                        sessionServ.nickName = res.data.nickname;
                        sessionServ.remainTime = res.data.remainTime;
                    }
                });
            /**
             * 把 invitationRecord 转换成更加适合显示的对象
             */
            let parseRecord = (record: { theme: string, startTime: Date, endTime: Date }) => {
                let fixNum = remote_res.fixNum;
                let _timeleft = () => record.startTime.getTime() - Date.now();
                let timeleft = {
                    hour: () => fixNum(Math.floor(_timeleft() / 1000 / 60 / 60)),
                    second: () => fixNum(Math.floor((_timeleft() % 3600000) / 1000 / 60) + 1)
                };
                let date = `${fixNum(record.startTime.getMonth() + 1)}-${fixNum(record.startTime.getDate())}`;
                let startTime = `${fixNum(record.startTime.getHours())}:${fixNum(record.startTime.getMinutes())}`;
                let endTime = `${fixNum(record.endTime.getHours())}:${fixNum(record.endTime.getMinutes())}`;
                let theme = record.theme;
                let tip = date;
                let today = new Date(`${record.startTime.getFullYear()}-${date}`);
                let computedTimeleft = record.startTime.getTime() - today.getTime();
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
                return { timeleft, date, startTime, endTime, theme, tip, record, alreadyStart: () => _timeleft() < 0 }
            };
            /**
             * 在作用域上存储邀请列表相关的信息
             */
            let invitationRecords = window['records'] = $scope.invitationRecords = {
                head: {}, // 第一条邀请记录特殊处理
                list: [], // 其余的邀请记录
                total: 0, // 总数
                size: 10,
                page: 0,
                hasNext: () => true
            };

            // 加载界面的同时立刻获取邀请列表前十项
            remoteServ
                .invitationRecord({ start: 1, size: invitationRecords.size })
                .then(res => {
                    invitationRecords.total = res.data.totalSize;
                    if (res.data.resultList.length > 0) {
                        invitationRecords.head = parseRecord(res.data.resultList[0]);
                        invitationRecords.list = res.data.resultList.slice(1).map(record => parseRecord(record));
                        invitationRecords.page = 1;
                        invitationRecords.hasNext = () => res.data.totalSize > 10;
                    }
                })
                .catch(error => {
                    if (error.code && error.msg) {
                        // console.log(error);
                    }
                });

            // 用户行为
            let actions = $scope.actions = {
                // 点击设置按钮
                handleSettingBtnClick() {
                    $state.go(components.setup_index.name);
                },
                // 上拉加载更多事件处理
                handleLoadMore() {
                    invitationRecords.hasNext = () => invitationRecords.total > invitationRecords.page * invitationRecords.size
                    if (invitationRecords.total > invitationRecords.page * invitationRecords.size) {
                        remoteServ
                            .invitationRecord({ start: ++invitationRecords.page, size: invitationRecords.size })
                            .then(res => {
                                invitationRecords.total = res.data.totalSize;
                                invitationRecords.list = invitationRecords.list.concat(res.data.resultList.slice(1).map(record => parseRecord(record)));
                            })
                    } else {
                        // invitationRecords.hasNext =()=> false;
                    }
                },
                handleInvitationRecordClick(record) {
                    $state.go('invitationEdit', { invitationId: record.invitationId });
                    document.body.scrollTop = 0;
                },
                //进入我的会客厅
                enterMyMeetingRoom() {
                    let lastTime = new Date();
                    console.log('Enter my room!');
                    if (sessionServ.myMeetingRoom.remainTime < 60) {
                        vm.closeAlert = NutModal.show('index-remain-time-low');
                        // native.messageBox({ title: '提示', content: '您没有足够的剩余时长进入会议室，请前往充值。' });
                        return;
                    }
                    let request = {
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
                        .then(res => {
                            if (res.resultCode === "0") {
                                $state.go("meetingRoomIndex");
                                setTimeout(function () {
                                    remoteServ.getAccountInfo()
                                        .then(res => {
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


        }]
});
/*
 * 开通我的会议室 
 */
meetingRoom.component(components.create.name, {
    template: components.create.template,
    controller: ['RouteControl', '$state', '$scope', '$rootScope', 'ActionSheet', remote_res.serviceName, 'NutModal', session.serviceName,
        function (RouteControl,
            $state,
            $scope,
            $rootScope,
            ActionSheet,
            remote: remote_res.RemoteResourceService,
            NutModal,
            session: session.SessionService) {

            /**
             * swiper显示bug处理
             */
            let swiperFix = () => {
                let elements = <HTMLDivElement[]><any>document.querySelectorAll('.swiper-pagination');
                for (let i = 0; i < elements.length; i++) {
                    let el = elements[i];
                    if (el.id != '') {
                        el.style.display = 'none'
                    }
                }
            };
            setTimeout(swiperFix, 100);

            // 检查是否开通过，是则跳转到主页面
            remote
                .login({ openId: session.openid, channel: '电信通' })
                .then((res) => {
                    if (res.data.status != 0) {
                        remote.getMeetingRoomInfo()
                            .then(function (res) {
                                if (res && res.code !== '38') {
                                    $state.go(components.index.name);
                                    RouteControl.popThis();
                                }
                            })
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
            $scope.create = () => {
                if ($scope.waiting) {
                    return;
                }
                let is2p3uper = false;
                try {
                    dxtApp.getVersion(function (a) {
                        if (parseFloat(a.version.slice(1, 4)) >= 2.3) {
                            is2p3uper = true;
                        } else {
                            is2p3uper = false;
                        }
                    })
                } catch (e) {

                }
                setTimeout(function () {
                    if (session.isBindMobile || !is2p3uper) {
                        $state.go('meetingRoomCreateSuccess');
                    } else {
                        let closeModal = NutModal.show('create-meetingroom-failure');
                        $scope.handleBindCancelButtonClicked = () => {
                            closeModal();
                        }
                        $scope.handleBindButtonClicked = () => {
                            // 调用原生界面让用户去绑定手机号
                            console.debug('调用原生界面让用户去绑定手机号');
                            try {
                                dxtApp.bindMobile(function (res) {
                                    console.debug(res);
                                    if (res.resultCode === '0') {
                                        session.isBindMobile = true;
                                    }
                                    closeModal();
                                })
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                }, 100)

            };
            $scope.gotoHelpPage = () => {
                $state.go('meetingRoomSetupHelp')
            }


            // 点击右上角按钮触发的回调函数
            $scope.log = () => {
                let btns: actionSheet.ActionSheetButton[] = [];
                btns.push(new actionSheet.ActionSheetButton('取消会议1', ['btn-default'], () => {
                    // console.log('取消会议1')
                }));
                btns.push(new actionSheet.ActionSheetButton('取消会议2', ['btn-alert'], () => {
                    // console.log('取消会议2')
                }));
                btns.push(new actionSheet.ActionSheetButton('取消会议3', ['btn-alert'], () => {
                    // console.log('取消会议3')
                }));
                ActionSheet.show(btns, () => {
                    // console.log('action sheet has been closed')
                })
            }
        }]
});

/*
* 开通我的会议室成功
*/
meetingRoom.component(components.createSuccess.name,{
    template:components.createSuccess.template,
    controller:['RouteControl', '$state', '$scope', '$rootScope', 'ActionSheet', remote_res.serviceName, session.serviceName,
        function (RouteControl,
                  $state,
                  $scope,
                  $rootScope,
                  ActionSheet,
                  remote: remote_res.RemoteResourceService,
                  session: session.SessionService){
            $scope.waiting = true;
            remote
                .createMeetingRoom()
                .then(res => {
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
                                alert(`发生错误：${JSON.stringify(res)}`);
                                break;
                        }
                    }
                    return remote.getMeetingRoomInfo();
                })
                .then(res => {
                    $scope.handleOKButtonClicked = () => {
                        RouteControl.popThis();
                        $state.go('meetingRoomIndex')
                    };
                })
    }]
})

/**
 * 充值/使用信息列表页
 */
meetingRoom.component(components.meetingTime.name, {
    template: components.meetingTime.template,
    controller: ['$scope', session.serviceName, remote_res.serviceName,
        function ($scope,
            sessionServ: SessionService,
            remoteServ: RemoteResourceService) {
            let data: any = $scope.data = {};
            data.remainTime = () => {
                return Math.floor(sessionServ.myMeetingRoom.remainTime / 60)
            };
            data.timeBillList = [];
            let pageNow = 0;
            let size = 20;
            let totalSize = 20;
            let getList = (start, size) => remoteServ.vmrTimeBill({ start, size })
                .then(res => {
                    totalSize = res.data.totalSize;
                    data.hasNextpage = totalSize > pageNow * size;
                    data.timeBillList = data.timeBillList.concat(res.data.resultList.map(timeBill => {
                        let name, date, time, dt, type = timeBill.type, id;
                        let getDate = dateStr => {
                            let date = new Date(dateStr);
                            let month = date.getMonth() + 1;
                            let day = date.getDate();
                            return remote_res.getFixedDateStr(date); //remote_res.fixNum(month) + '-' + remote_res.fixNum(day);
                        };
                        let getTime = dateStr => {
                            let date = new Date(dateStr);
                            let hours = date.getHours();
                            let minutes = date.getMinutes();
                            return remote_res.fixNum(hours) + ':' + remote_res.fixNum(minutes);
                        };
                        switch (timeBill.type) {
                            case 1:
                                name = timeBill.scheduleName;//时长消耗类型名称（v2.5的需要包括：充值、活动赠送、失效（充值失效和活动赠送失效、会客）
                                date = getDate(timeBill.startTime);
                                time = `${getTime(timeBill.startTime)}-${getTime(timeBill.endTime)}`;
                                dt = Math.round(timeBill.duration / 60);
                                id = timeBill.id;
                                break;
                            case 2:
                                name = timeBill.scheduleName;
                                date = getDate(timeBill.startTime);
                                time = `${getTime(timeBill.startTime)}`;
                                dt = Math.round(timeBill.duration / 60);
                                id = timeBill.id;
                                break;
                            case 3:
                                name = timeBill.scheduleName;
                                date = getDate(timeBill.startTime);
                                time = `${getTime(timeBill.startTime)}`;
                                dt = Math.round(timeBill.duration / 60);
                                id = timeBill.id;
                                break;
                            case 4:
                                name = timeBill.scheduleName;
                                date = getDate(timeBill.startTime);
                                time = `${getTime(timeBill.startTime)}`;
                                dt = Math.round(timeBill.duration / 60);
                                id = timeBill.id;
                                break;
                        }
                        return { name, date, time, dt, type, id };
                    }))
                });

            // getList(pageNow, size);
            data.hasNextpage = true;
            $scope.getMore = () => {
                if (totalSize > pageNow * size) {
                    getList(++pageNow, size);
                } else {
                    data.hasNextpage = false;
                }
            }
        }]
});

meetingRoom.component(components.meetingDetails.name, {
    template: components.meetingDetails.template,
    controller: ['$scope', '$stateParams', remote_res.serviceName, session.serviceName,
        function ($scope, $stateParams, remoteServ: RemoteResourceService, sessionServ: SessionService) {
            remoteServ.useSchedule({ id: $stateParams.id })
                .then(res => {
                    let list = res.data.participantsList;
                    list.forEach(item => {
                        item.duration = Math.round(item.duration / 60)
                    });
                    let amount = res.data.participantsAmount;
                    let theme = res.data.theme;
                    let meetingRoomNum=res.data.meetingRoomNum;
                    let duration = Math.round(res.data.duration / 60);
                    let startTime = new Date(res.data.startTime);
                    let endTime = new Date(res.data.endTime);
                    let time = remote_res.fixNum(startTime.getFullYear()) + '-' + remote_res.fixNum(startTime.getMonth() + 1) + '-' + remote_res.fixNum(startTime.getDate())
                        + ' ' + remote_res.fixNum(startTime.getHours()) + ':' + remote_res.fixNum(startTime.getMinutes()) + '-' + remote_res.fixNum(endTime.getHours()) + ':' + remote_res.fixNum(endTime.getMinutes());
                    $scope.data = { list, amount, theme, meetingRoomNum,duration, time };
                    $scope.totalDuration = list.reduce((pv, nv) => pv + nv.duration, 0);
                })
        }]
});

meetingRoom.component(components.rechargeDetails.name, {
    template: components.rechargeDetails.template,
    controller: ['$scope', '$stateParams', remote_res.serviceName,
        function ($scope, $stateParams, remoteServ: RemoteResourceService) {
            let id = $stateParams.id;
            remoteServ.recharge({ id: id })
                .then(res => {
                    let data = res.data;
                    let meetingRoomNum = data.meetingRoomNum;
                    let createTime=new Date(data.createTime);
                    let valid;
                    if(data.expirationTime==null){
                        valid="永久有效";
                    }
                    else{
                        let expirationTime=new Date(data.expirationTime.replace(/\-/g, '/'));
                        valid=remote_res.fixNum(expirationTime.getFullYear())+'-'+remote_res.fixNum(expirationTime.getMonth()+1)+'-'+remote_res.fixNum(expirationTime.getDate())

                    }


                    let time=remote_res.fixNum(createTime.getFullYear()) + '-' + remote_res.fixNum(createTime.getMonth() + 1) + '-' + remote_res.fixNum(createTime.getDate())
                        + ' ' + remote_res.fixNum(createTime.getHours()) + ':' + remote_res.fixNum(createTime.getMinutes())
                    let money = data.money;
                    let duration = Math.round(data.duration / 60);
                    $scope.data = { createTime,time,valid, meetingRoomNum, money, duration, data };
                })
        }]
});
meetingRoom.component(components.presentDetails.name, {
    template: components.presentDetails.template,
    controller: ['$scope', '$stateParams', remote_res.serviceName,
        function ($scope, $stateParams, remoteServ: RemoteResourceService) {
            let id = $stateParams.id;
            remoteServ.recharge({ id: id })
                .then(res => {
                    let data = res.data;
                    let meetingRoomNum = data.meetingRoomNum;
                    let createTime=new Date(data.createTime);
                    let valid;
                    if(data.expirationTime==null){
                        valid="永久有效"
                    }
                    else{
                        let expirationTime=new Date(data.expirationTime.replace(/\-/g, '/'));
                        valid=remote_res.fixNum(expirationTime.getFullYear())+'-'+remote_res.fixNum(expirationTime.getMonth()+1)+'-'+remote_res.fixNum(expirationTime.getDate())

                    }
                    let time=remote_res.fixNum(createTime.getFullYear()) + '-' + remote_res.fixNum(createTime.getMonth() + 1) + '-' + remote_res.fixNum(createTime.getDate())
                        + ' ' + remote_res.fixNum(createTime.getHours()) + ':' + remote_res.fixNum(createTime.getMinutes())
                    let money = data.money;
                    let duration = Math.round(data.duration / 60);
                    $scope.data = { createTime,time,valid, meetingRoomNum, money, duration, data };
                })
        }]
});
meetingRoom.component(components.invalidDetails.name, {
    template: components.invalidDetails.template,
    controller: ['$scope', '$stateParams', remote_res.serviceName,
        function ($scope, $stateParams, remoteServ: RemoteResourceService) {
            let id = $stateParams.id;
            remoteServ.recharge({ id: id })
                .then(res => {
                    let data = res.data;
                    let meetingRoomNum = data.meetingRoomNum;
                    let createTime=new Date(data.createTime);
                    let expirationTime=new Date(data.expirationTime.replace(/\-/g, '/'));
                    let time=remote_res.fixNum(createTime.getFullYear()) + '-' + remote_res.fixNum(createTime.getMonth() + 1) + '-' + remote_res.fixNum(createTime.getDate())
                        + ' ' + remote_res.fixNum(createTime.getHours()) + ':' + remote_res.fixNum(createTime.getMinutes())
                    let valid=remote_res.fixNum(expirationTime.getFullYear())+'-'+remote_res.fixNum(expirationTime.getMonth()+1)+'-'+remote_res.fixNum(expirationTime.getDate())
                    let money = data.money;
                    let duration = Math.round(data.duration / 60);
                    $scope.data = { createTime,time,valid, meetingRoomNum, money, duration, data };
                })
        }]
});
interface ISetupScope extends angular.IScope {
    meetingRoom: IMeetingRoom;
    nickname: string
}
meetingRoom.component(components.setup_index.name, {
    template: components.setup_index.template,
    controller: [
        '$scope', remote_res.serviceName, session.serviceName,
        function ($scope: ISetupScope,
            remoteServ: remote_res.RemoteResourceService,
            sessionServ: session.SessionService) {
            $scope.nickname = sessionServ.nickName;
            remoteServ.getMeetingRoomInfo()
                .then(res => {
                    let target = res.data[res.data.length - 1];
                    sessionServ.myMeetingRoom = target;
                    $scope.meetingRoom = target;
                })
        }]
});
/**
 * 设置主持人密码
 */
meetingRoom.component(components.setup_hostpass.name, {
    template: components.setup_hostpass.template,
    controller: [
        '$scope', session.serviceName, remote_res.serviceName, 'RouteControl', '$timeout',
        function ($scope,
            sessionServ: SessionService, // 会话数据
            remoteServ: RemoteResourceService, // 网络访问层
            RouteControl,// 路由控制服务：回退
            $timeout) {
            // TODO: 参考
            $scope.showMsg = false;
            $scope.myMeetingRoom = angular.merge({}, sessionServ.myMeetingRoom);
            $scope.save = () => {
                let hostPass = $scope.myMeetingRoom.hostPassword;
                let canSetup = true;
                let num = 0;
                canSetup = canSetup && ((/^\d{6}$/.test(hostPass)) || (hostPass == ''));
                canSetup ? num = 0 : num++;
                canSetup = canSetup && ($scope.myMeetingRoom.hostPassword != $scope.myMeetingRoom.guestPassword);
                canSetup ? num = 0 : num++;
                if (canSetup) {
                    remoteServ.editMeetingRoom($scope.myMeetingRoom)
                        .then((result) => {
                            if (result.code == '0') {
                                // console.log('保存成功');
                                return remoteServ.getMeetingRoomInfo();
                            } else {
                                $scope.errorMsg = '保存失败';
                                $scope.showMsg = true;
                                $timeout(function () {
                                    $scope.showMsg = false;
                                }, 2000);
                                return remoteServ.getMeetingRoomInfo();
                            }
                        })
                        // 保存成功或失败之后，再去更新自身的数据
                        .then((result: IGetMeetingRoomResponse) => {
                            let target = result.data[result.data.length - 1];
                            sessionServ.myMeetingRoom = target;
                            // 回退到上一页
                            RouteControl.goBack();
                        })
                        .catch(reason => {
                            $scope.errorMsg = '网络出现问题，请稍后重新保存！';
                            $scope.showMsg = true;
                            $timeout(function () {
                                $scope.showMsg = false;
                            }, 2000);
                        })
                } else {
                    if (num == 1) {
                        $scope.errorMsg = '主持人密码不能与入会密码一致！';
                        $scope.showMsg = true;
                        $timeout(function () {
                            $scope.showMsg = false;
                        }, 2000);
                    } else if (num == 2) {
                        $scope.errorMsg = '输入格式不正确！';
                        $scope.showMsg = true;
                        $timeout(function () {
                            $scope.showMsg = false;
                        }, 2000);
                    }
                }
            }
        }]
});
/**
 * 设置入会密码
 */
meetingRoom.component(components.setup_guestpass.name, {
    template: components.setup_guestpass.template,
    controller: [
        '$scope', session.serviceName, remote_res.serviceName, 'RouteControl', '$timeout',
        function ($scope, sessionServ: SessionService, remoteServ: RemoteResourceService, RouteControl, $timeout) {
            $scope.showMsg = false;
            $scope.myMeetingRoom = angular.merge({}, sessionServ.myMeetingRoom);
            $scope.save = () => {
                let guestPassword = $scope.myMeetingRoom.guestPassword;
                let canSetup = true;
                let num = 0;
                canSetup = canSetup && ((/^\d{6}$/.test(guestPassword)) || (guestPassword == ''));
                canSetup ? num = 0 : num++;
                canSetup = canSetup && ($scope.myMeetingRoom.hostPassword != $scope.myMeetingRoom.guestPassword);
                canSetup ? num = 0 : num++;
                if (canSetup) {
                    remoteServ.editMeetingRoom($scope.myMeetingRoom)
                        .then((result) => {
                            if (result.code == '0') {
                                // console.log('保存成功');
                                return remoteServ.getMeetingRoomInfo();
                            } else {
                                $scope.errorMsg = '保存失败';
                                $scope.showMsg = true;
                                $timeout(function () {
                                    $scope.showMsg = false;
                                }, 2000);
                                return remoteServ.getMeetingRoomInfo();
                            }
                        })
                        // 保存成功或失败之后，再去更新自身的数据
                        .then((result: IGetMeetingRoomResponse) => {
                            let target = result.data[result.data.length - 1];
                            sessionServ.myMeetingRoom = target;
                            RouteControl.goBack();
                        })
                        .catch(reason => {
                            $scope.errorMsg = '网络出现问题，请稍后重新保存！';
                            $scope.showMsg = true;
                            $timeout(function () {
                                $scope.showMsg = false;
                            }, 2000);
                        })
                } else {
                    if (num == 1) {
                        $scope.errorMsg = '入会密码不能与主持人密码一致！';
                        $scope.showMsg = true;
                        $timeout(function () {
                            $scope.showMsg = false;
                        }, 2000);
                    } else if (num == 2) {
                        $scope.errorMsg = '密码输入格式不正确！';
                        $scope.showMsg = true;
                        $timeout(function () {
                            $scope.showMsg = false;
                        }, 2000);
                    }
                }

            }
        }]
});
/**
 * 设置会议室的名字
 */
meetingRoom.component(components.setup_name.name, {
    template: components.setup_name.template,
    controller: [
        '$scope', session.serviceName, remote_res.serviceName, 'RouteControl',
        function ($scope, sessionServ: SessionService, remoteServ: RemoteResourceService, RouteControl) {
            $scope.myMeetingRoom = angular.merge({}, sessionServ.myMeetingRoom);
            $scope.save = () => {
                remoteServ.editMeetingRoom($scope.myMeetingRoom)
                    .then((result) => {
                        if (result.code == '0') {
                            // console.log('保存成功');
                            return remoteServ.getMeetingRoomInfo();
                        } else {
                            // console.log('保存失败');
                            return remoteServ.getMeetingRoomInfo();
                        }
                    })
                    // 保存成功或失败之后，再去更新自身的数据
                    .then((result: IGetMeetingRoomResponse) => {
                        let target = result.data[result.data.length - 1];
                        sessionServ.myMeetingRoom = target;
                        RouteControl.goBack();
                    })
            }
        }]
});
/**
 * 设置“昵称”
 */
meetingRoom.component(components.setup_meetingname.name, {
    template: components.setup_meetingname.template,
    controller: [
        '$scope', session.serviceName, remote_res.serviceName, 'RouteControl',
        function ($scope, sessionServ: SessionService, remoteServ: RemoteResourceService, RouteControl) {
            $scope.myMeetingRoom = angular.merge({}, sessionServ.myMeetingRoom);
            $scope.save = () => {
                remoteServ.editMeetingRoom($scope.myMeetingRoom)
                    .then((result) => {
                        if (result.code == '0') {
                            // console.log('保存成功');
                            return remoteServ.getMeetingRoomInfo();
                        } else {
                            // console.log('保存失败');
                            return remoteServ.getMeetingRoomInfo();
                        }
                    })
                    // 保存成功或失败之后，再去更新自身的数据
                    .then((result: IGetMeetingRoomResponse) => {
                        let target = result.data[result.data.length - 1];
                        sessionServ.myMeetingRoom = target;
                        RouteControl.goBack();
                    })
            }
        }]
});

meetingRoom.component(components.setup_help.name, {
    template: components.setup_help.template,
    controller: ['$scope', function ($scope) {
    }]
});

meetingRoom.component('test', {
    template: require('./test.tmpl.html'),
    controllerAs: 'vm',
    controller: ['NativeApi', function (native: NativeApiService) {
        this.getNetworkType = () => native.getNetworkType().then(res => this.msg = 'networktype: ' + JSON.stringify(res));
        this.messageBox = () => native.messageBox({ title: 'hello', content: 'world' })
            .then(res => this.msg = 'msgbox: ' + JSON.stringify(res));
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
    function ($stateProvider: router.StateProvider) {
        $stateProvider
            .state({
                name: 'test',
                url: '/test',
                component: 'test'
            })
            .state({
                name: components.index.name,
                url: '/my-meeting-room/index',
                component: components.index.name
            })
            .state({
                name: components.create.name,
                url: '/my-meeting-room/create',
                component: components.create.name
            })
            .state({
                name:components.createSuccess.name,
                url:'/my-meeting-room/createSuccess',
                component:components.createSuccess.name
            })
            .state({
                name: components.meetingTime.name,
                url: '/my-meeting-room/meeting-time',
                component: components.meetingTime.name
            })
            .state({
                name: components.meetingDetails.name,
                url: '/my-meeting-room/meeting-details/:id',
                component: components.meetingDetails.name
            })
            .state({
                name: components.rechargeDetails.name,
                url: '/my-meeting-room/recharge-details/:id',
                component: components.rechargeDetails.name
            })
            .state({
                name: components.presentDetails.name,
                url: '/my-meeting-room/present-details/:id',
                component: components.presentDetails.name
            })
            .state({
                name: components.invalidDetails.name,
                url: '/my-meeting-room/invalid-details/:id',
                component: components.invalidDetails.name
            })
            .state({
                name: components.setup_guestpass.name,
                url: '/my-meeting-room/setup_meeting_room/guest-password',
                component: components.setup_guestpass.name
            })
            .state({
                name: components.setup_hostpass.name,
                url: '/my-meeting-room/setup_meeting_room/host-password',
                component: components.setup_hostpass.name
            })
            .state({
                name: components.setup_index.name,
                url: '/my-meeting-room/setup_meeting_room/index',
                component: components.setup_index.name
            })
            .state({
                name: components.setup_help.name,
                url: '/my-meeting-room/setup_meeting_room/help',
                component: components.setup_help.name
            })
            .state({
                name: components.setup_name.name,
                url: '/my-meeting-room/setup_meeting_room/name',
                component: components.setup_name.name
            })

            .state({
                name: components.setup_meetingname.name,
                url: '/my-meeting-room/setup_meeting_room/meetingname',
                component: components.setup_meetingname.name
            })
    }
]);