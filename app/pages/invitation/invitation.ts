/*
 * 会议邀请相关的页面，全部逻辑集中于此
 */

import {SessionService} from "../../common/models/session";
declare let require; // 为webpack的require语法所做的特殊声明
declare let $;
require('./invitation_style');

import * as angular from 'angular';
import * as router from 'angular-ui-router';
import * as actionSheet from '../../components/nut-action-sheet'
import * as sessionModule from '../../common/models/session'
import * as RouteControl from '../../common/route_control'
import * as nativeModule from '../../common/nativeApi'
import * as remote_res from '../../common/remote_resource'
import {RemoteResourceService} from "../../common/remote_resource"
import {IInvitationDetailMessage} from "../../common/models/Business/InvitationDetail";
import {ICancelInvitationResponse, ICancelInvitationRequest} from "../../common/models/Business/CancelInvitation";
import {NativeApiService} from "../../common/nativeApi";
import * as Global from '../../global'
import {shareUrl} from '../../global';
import * as uiRouter from 'angular-ui-router';

let defaultAvatar = require('../../res/imgs/avatar.png');

/**
 * 模块的名字
 */
export let name = 'me.pages.invitation';

/**
 * 几个组件的相关信息（这个项目里，一个页面对应一个组件）
 */
export let components = {
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

let invitation = angular.module(name, []);
// 调用原生分享（分享到电信通、微信或者QQ，其中分享到电信通可能需要更多信息（适用于2.3以后版本））
let share = (native, type, res, name: string, link: string, imgUrl: string, mTitle?: string, mTime?: string, mId?: string, mPwd?: string, mEndTime?: string) => {
    imgUrl = Global.shareImgUrl;
    let queryStr = `?invitationId=${res.data.invitationId}`;
    let queryStr1 = `?invitationId=${res.data.invitationId}&mEndTime=${mEndTime}`;
    console.debug('share time:', typeof mTime);
    console.log(mEndTime)
    switch (type) {
        case 'dxt':
            return native.shareDxt({
                title: '会客邀请',
                desc: res.data.message1,
                link: link + queryStr,
                imgUrl: imgUrl,
                mTitle: mTitle,
                mTime: mTime,//这里当选择半小时的时候时间的显示有问题
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
let singlefyByCloudpId = (array) => array.reduce((list, item) => {
    if (list.filter(x => x.cloudpId === item.cloudpId).length > 0) {
        return list;
    } else {
        return list.concat(item)
    }
}, []);

// 创建会议邀请页面
invitation.component(components.create.name, {
    template: components.create.template,
    bindings: {},
    controller: [
        '$scope', remote_res.serviceName, sessionModule.serviceName, nativeModule.servName, 'RouteControl', '$state',
        function ($scope, remote: remote_res.RemoteResourceService, session: sessionModule.SessionService, native: nativeModule.NativeApiService, routeControl, $state: uiRouter.StateService) {
            $scope.invitationTypes = [
                {url: require('../../res/imgs/dxt-logo1.png'), name: '大麦家视宝', type: 'dxt'},
                {url: require('../../res/imgs/qq-logo.png'), name: 'QQ好友', type: 'qq'},
                {url: require('../../res/imgs/wx-logo.png'), name: '微信好友', type: 'wx'},
            ];
            session.inputPageInvitationTheme || (session.inputPageInvitationTheme = session.myMeetingRoom.name)
            $scope.theme = () => session.inputPageInvitationTheme ? session.inputPageInvitationTheme : ''; // 从session服务中拿到存储的会议主题
            let timeValues = $scope.timeValues = {
                startTime: new Date(Date.now() + 30 * 60 * 1000),
                duration: new Date('1970/1/1 1:0:0'),
                durationValue: "60"
            }

            window['scope'] = $scope;
            $scope.showChange = () => {
                let str = ''
                str += $scope.getStartDate();
                str += ' , ' + $scope.getStartTime();
                str += ' , ' + $scope.getDuration();
            }

            let fixNum = remote_res.fixNum;
            $scope.getStartDate = () => {
                let date: Date = $scope.timeValues.startTime || ($scope.timeValues.startTime = new Date());
                return `${fixNum(date.getFullYear())}-${fixNum(date.getMonth() + 1)}-${fixNum(date.getDate())}`;
            }
            $scope.getStartTime = () => {
                let time: Date = $scope.timeValues.startTime || ($scope.timeValues.startTime = new Date());
                return `${fixNum(time.getHours())}:${fixNum(time.getMinutes())}`;
            }
            $scope.getDuration = () => {
                let time: Date = $scope.timeValues.duration || ($scope.timeValues.duration = new Date('1970/1/1 1:0:0'));
                return `${fixNum(time.getHours())}:${fixNum(time.getMinutes())}`;

            }
            $scope.getEndTime = () => {
                let durationTime = $scope.invitation.duration || ($scope.invitation.duration = new Date('1970/1/1 1:0:0'));
                let duration = durationTime.getHours() * 60 * 60 * 1000 + durationTime.getSeconds() * 60 * 1000;
                let endTime = new Date($scope.invitation.startTime.getTime() + duration);
                return `${fixNum(endTime.getHours())}:${fixNum(endTime.getMinutes())}`
            }
            // 发送邀请的次数 大于0则只分享，不创建
            let launchInvitationCount = 0;
            // 缓存下来的邀请信息
            let launchInvitationCachedResponse;
            // let shareBtnClicked = false;
            $scope.invite = (type) => {
                // 检查时间
                if (timeValues.startTime.getTime() < Date.now()) {
                    native.messageBox({title: '提示', content: '会客的开始时间不可早于当前时间。'});
                    return;
                }
                $scope.waiting = true;

                //  分享邀请链接
                if (launchInvitationCount > 0) {
                    // 这里的代码没有意义
                    share(native, type, launchInvitationCachedResponse, $scope.theme(), Global.shareUrl + '/invitation.html', '',
                        $scope.session.inputPageInvitationTheme,
                        `${$scope.getStartDate()} ${$scope.getStartTime()} - ${$scope.getEndTime()}`,
                        session.myMeetingRoom.meetingRoomNum + '',
                        session.myMeetingRoom.guestPassword
                    ).then(res => {

                        if (res.resultCode != 0) {
                            native.messageBox({title: '提示', content: '分享失败。'});
                            $scope.waiting = false;
                        } else {
                            routeControl.goBack();
                        }
                    })
                }
                else {

                    let dHours, dMinutes;
                    dHours = timeValues.duration.getHours();
                    dMinutes = timeValues.duration.getMinutes();

                    remote.launchInvitation({
                        theme: session.inputPageInvitationTheme,
                        startTime: remote_res.toServerDateString(timeValues.startTime),
                        // endTime: remote_res.toServerDateString(new Date(timeValues.startTime.getTime() + (dHours * 60 + dMinutes) * 60 * 1000))
                        endTime: remote_res.toServerDateString(new Date(timeValues.startTime.getTime() + (parseInt(timeValues.durationValue)) * 60 * 1000))
                    })
                        .then(res => {
                            if (res.code === '999') {
                                console.debug('服务器内部错误');
                            }
                            //创建邀请页面在点击返回按钮时略过直接返回主页，所以需要出栈
                            routeControl.popThis();
                            $state.go('invitationInvite', {invitationId: res.data.invitationId});


                        })
                        .catch(error => {
                            console.debug('网络错误', error);
                        })
                }
            }
        }]
});

invitation.component(components.setupTheme.name, {
    template: components.setupTheme.template,
    controller: ['$scope', sessionModule.serviceName, 'RouteControl', '$stateParams', remote_res.serviceName,
        function ($scope, session: SessionService, RouteControl, $stateParams, remoteServ: RemoteResourceService) {
            let data: any = $scope.data = {};
            data.theme = session.inputPageInvitationTheme === '' ? '' : session.inputPageInvitationTheme;
            console.log($stateParams.invitationId + "邀请id")
            if ($stateParams.invitationId) {
                $scope.save = () => {
                    // remoteServ.editInvitation()
                    remoteServ.invitationDetail({invitationId: $stateParams.invitationId})
                        .then(res => {
                            let _data = angular.merge({}, res.data);
                            _data.theme = data.theme;
                            let requestData = {
                                startTime: remote_res.toServerDateString(_data.startTime),
                                endTime: remote_res.toServerDateString(_data.endTime),
                                theme: _data.theme,
                                // meetingRoomNum:_data.meetingRoomNum,
                                // status:_data.status,
                            };
                            return remoteServ.editInvitation(requestData, {invitationId: $stateParams.invitationId});
                        })
                        .then(res => {
                            console.log('主题以保存，返回上一页面', res);
                            session.inputPageInvitationTheme = data.theme;
                            RouteControl.goBack();
                        })
                        .catch(reason => {
                            // console.log(reason);
                        });
                };
            } else {
                $scope.save = () => {
                    session.inputPageInvitationTheme = data.theme;
                    RouteControl.goBack();
                };
            }
            $scope.delInput = () => {
                // console.log($scope.theme)
            }
        }]
});

invitation.component(components.detail.name, {
    template: components.detail.template,
    bindings: {},
    controller: ['$scope', function ($scope) {
    }]
});

/**  路由“/invitation/edit/:invitationId”所匹配的路由参数 */
interface IEditRouteParams extends router.StateParams {
    /** 会议邀请的id */
    invitationId: string;
}

invitation.component(components.edit.name, {
    template: components.edit.template,
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
                  $routeParams: IEditRouteParams,
                  sessionServ: SessionService,
                  remoteServ: RemoteResourceService,
                  native: NativeApiService,
                  routeControl,
                  NutModal) {
            let invitationId = this.invitationId = $routeParams.invitationId;
            // 分享按钮被点击
            $scope.handleShareBtnCLick = (type) => {
                share(native,
                    type,
                    {
                        data: {
                            message1: `${sessionServ.nickName}特邀您加入我的贵宾会客厅，点击 ${Global.shareUrl + '/invitation.html?invitationId=' + invitationId} 查看会议详情。`,
                            message2: `${sessionServ.nickName}特邀您加入我的贵宾会客厅，点击 ${Global.shareUrl + '/invitation.html?invitationId=' + invitationId} 查看会议详情。`,
                            invitationId: invitationId
                        }
                    }, $scope.invitation.theme,
                    Global.shareUrl + '/invitation.html',
                    '',
                    $scope.invitation.theme,
                    `${$scope.getStartDate()} ${$scope.getStartTime()} - ${$scope.getEndTime()}`,
                    sessionServ.myMeetingRoom.meetingRoomNum + '',
                    sessionServ.myMeetingRoom.guestPassword,
                    $scope.getStartDate() + ' ' + $scope.getEndTime()
                ).then(res => {
                    console.log($scope.getStartTime(), $scope.getEndTime())
                    // console.log(res);
                    console.log(res)
                    if (res.resultCode != 0) {
                        native.messageBox({title: '提示', content: '分享失败。'})
                    } else {
                        // TODO： 分享成功之后的处理
                        if (res.cloudpIds) {
                            let list: { cloudpId: string, nickname: string, avatar: string }[] = res.cloudpIds;

                            $scope.guestList = $scope.guestList ? $scope.guestList.concat(list) : list;
                            console.log($scope.guestList + "打印出来的")
                            $scope.guestList = singlefyByCloudpId($scope.guestList);

                            $scope.guestList.forEach(x => {
                                if (!x.avatar) {
                                    x.avatar = defaultAvatar;
                                }
                            })

                            remoteServ
                                .saveInvitedList(invitationId, $scope.guestList.map(x => ({
                                    dxtNum: x.cloudpId,
                                    avatar: x.avatar || defaultAvatar,
                                    nickname: x.nickname
                                })))
                                .then(res => {
                                    console.debug('保存成功:', res)
                                })
                                .catch(error => {
                                    console.debug('保存失败:', error)
                                });
                        }
                    }
                })
            };
            // 邀请类型
            $scope.invitationTypes = [
                {url: require('../../res/imgs/dxt-logo1.png'), name: '大麦家视宝', type: 'dxt'},
                {url: require('../../res/imgs/qq-logo.png'), name: 'QQ好友', type: 'qq'},
                {url: require('../../res/imgs/wx-logo.png'), name: '微信好友', type: 'wx'},
            ];
            // 设置主题被点击
            $scope.handleSetupTheme = () => {
                sessionServ.inputPageInvitationTheme = $scope.invitation.theme;
                // console.log($scope.invitation);
            };
            // 数字补齐'0'的函数
            let fixNum = remote_res.fixNum;
            $scope.getStartDate = () => {
                let date: Date = $scope.invitation.startTime || ($scope.invitation.startTime = new Date());
                return `${fixNum(date.getFullYear())}-${fixNum(date.getMonth() + 1)}-${fixNum(date.getDate())}`;
            }
            $scope.getStartTime = () => {
                let time: Date = $scope.invitation.startTime || ($scope.invitation.startTime = new Date());
                return `${fixNum(time.getHours())}:${fixNum(time.getMinutes())}`;
            }
            $scope.getDuration = () => {
                let time: Date = $scope.invitation.duration || ($scope.invitation.duration = new Date('1970/1/1 1:0:0'));
                return `${fixNum(time.getHours())}:${fixNum(time.getMinutes())}`;
            }

            $scope.getEndTime = () => {
                let durationTime = $scope.invitation.duration || ($scope.invitation.duration = new Date('1970/1/1 1:0:0'));
                let duration = durationTime.getHours() * 60 * 60 * 1000 + durationTime.getMinutes() * 60 * 1000
                let endTime = new Date($scope.invitation.startTime.getTime() + duration);
                console.log(endTime)
                return `${fixNum(endTime.getHours())}:${fixNum(endTime.getMinutes())}`
            }
            $scope.transTimeStamp = (date) => {
                let data = (new Date(date).getTime()) / 1000
                return data + '';
            }
            let sendEditRequest = () => {
                let invitation = $scope.invitation;
                let theme = invitation.theme;
                let _startTime: Date = invitation.startTime;
                let _duration: Date = invitation.duration;
                let durationValue: string = invitation.durationValue;
                let startTime = remote_res.toServerDateString(_startTime);
                let hh = _duration.getHours();
                let mm = _duration.getMinutes();
                let sss = hh * 60 * 60 * 1000 + mm * 60 * 1000;
                // let _endTime = new Date(_startTime.getTime() + sss);
                let _endTime = new Date(_startTime.getTime() + parseInt(durationValue) * 60 * 1000);
                let endTime = remote_res.toServerDateString(_endTime);

                if (_startTime.getTime() < Date.now()) {
                    native.messageBox({title: '注意', content: '您选择的会议开始时间早于当前时间。'})
                    // return;
                }

                remoteServ.editInvitation({theme, startTime, endTime}, {invitationId: invitationId})
                    .then(res => {
                        // console.log('edit invitation:', res);
                    })

            }
            $scope.startTimeChange = () => {
                sendEditRequest();
            }
            $scope.durationChange = () => {
                sendEditRequest();
            }

            let parseInvitation = (data: IInvitationDetailMessage) => {
                let theme = data.theme;
                let startTime = data.startTime;
                let endTime = data.endTime;

                let minutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
                let hh = Math.floor(minutes / 60);
                let mm = minutes % 60;
                let duration = new Date(`2016/1/1 ${hh}:${mm}:0`)
                let durationValue = minutes + '';
                return {theme, startTime, endTime, duration, data, durationValue}
            };
            remoteServ.invitationDetail({invitationId: invitationId})
                .then(res => {
                    $scope.guestList = res.data.invitedList;
                    $scope.invitation = parseInvitation(res.data);
                });
            $scope.cancelInvitation = () => {
                // console.debug('取消会议');
                let cancel = NutModal.show('invitation-edit-cancel');
                $scope.alertCancel = () => {
                    // console.log("取消会议hahah ")
                    cancel();
                };
                $scope.alertOk = () => {
                    remoteServ.cancelInvitation({invitationId: invitationId})
                        .then(res => {
                            $scope.guestList.forEach((item) => {
                                native.sendIM(item.cloudpId, `取消会客邀请通知：抱歉已取消原定于${$scope.getStartDate()},${$scope.getStartTime()}开始的${$scope.invitation.theme || '会客'}邀请。`)
                            })

                            routeControl.goBack();
                        });
                }
            }
        }

    ]
})


invitation.component(components.invite.name, {
    template: components.invite.template,
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
                  $routeParams: IEditRouteParams,
                  sessionServ: SessionService,
                  remoteServ: RemoteResourceService,
                  native: NativeApiService,
                  routeControl) {
            let invitationId = this.invitationId = $routeParams.invitationId;
            $scope.vmrName = sessionServ.myMeetingRoom.name;
            $scope.vmrId = sessionServ.myMeetingRoom.meetingRoomNum;
            $scope.vmrGuestPass = sessionServ.myMeetingRoom.guestPassword;
            $scope.nickname = sessionServ.nickName;
            $scope.handleShareBtnCLick = (type) => {
                share(native,
                    type,
                    {
                        data: {
                            message1: `${sessionServ.nickName}特邀您加入我的贵宾会客厅，点击 ${Global.shareUrl + '/invitation.html?invitationId=' + invitationId} 查看会议详情。`,
                            message2: `${sessionServ.nickName}特邀您加入我的贵宾会客厅，点击 ${Global.shareUrl + '/invitation.html?invitationId=' + invitationId} 查看会议详情。`,
                            invitationId: invitationId
                        }
                    },
                    $scope.invitation.theme,
                    Global.shareUrl + '/invitation.html',
                    '',
                    $scope.invitation.theme,
                    `${$scope.getStartDate()} ${$scope.getStartTime()} -${$scope.getEndTime()}`,
                    sessionServ.myMeetingRoom.meetingRoomNum + '',
                    sessionServ.myMeetingRoom.guestPassword,
                    $scope.getStartDate() + ' ' + $scope.getEndTime()
                )
                    .then(res => {
                        console.log(res);
                        console.log(res.resultCode)
                        if (res.resultCode != 0) {
                            native.messageBox({title: '提示', content: '分享失败。'})
                        } else {
                            if (res.cloudpIds) {
                                let list: { cloudpId: string, nickname: string, avatar: string }[] = res.cloudpIds;
                                console.debug(list);
                                $scope.guestList = $scope.guestList ? $scope.guestList.concat(list) : list;
                                $scope.guestList = singlefyByCloudpId($scope.guestList);
                                console.log($scope.guestList + "会议邀请时的名单")
                                remoteServ.saveInvitedList(invitationId, $scope.guestList.map(x =>
                                    ({
                                        dxtNum: x.cloudpId,
                                        avatar: x.avatar || defaultAvatar,
                                        nickname: x.nickname
                                    })
                                ));
                                $scope.guestList.forEach(x => {
                                    if (!x.avatar) {
                                        x.avatar = defaultAvatar;
                                    }
                                })
                            }
                        }
                    })
                    .catch(res => {
                        console.warn('错误的结果为：', res);
                    })
            };
            $scope.invitationTypes = [
                {url: require('../../res/imgs/dxt-logo1.png'), name: '大麦家视宝', type: 'dxt'},
                {url: require('../../res/imgs/qq-logo.png'), name: 'QQ好友', type: 'qq'},
                {url: require('../../res/imgs/wx-logo.png'), name: '微信好友', type: 'wx'},
            ];
            $scope.handleSetupTheme = () => {
                sessionServ.inputPageInvitationTheme = $scope.invitation.theme;
                // console.log($scope.invitation);
            };

            let fixNum = remote_res.fixNum;
            $scope.getStartDate = () => {
                let date: Date = $scope.invitation.startTime || ($scope.invitation.startTime = new Date());
                return `${fixNum(date.getFullYear())}-${fixNum(date.getMonth() + 1)}-${fixNum(date.getDate())}`;
            }
            $scope.getStartTime = () => {
                let time: Date = $scope.invitation.startTime || ($scope.invitation.startTime = new Date());
                return `${fixNum(time.getHours())}:${fixNum(time.getMinutes())}`;
            }
            $scope.getDuration = () => {
                let time: Date = $scope.invitation.duration || ($scope.invitation.duration = new Date('1970/1/1 1:0:0'));
                return `${time.getHours()}小时 ${(time.getMinutes()) > 0 ? time.getMinutes() + '分钟' : ''}`;
            }
            $scope.getEndTime = () => {
                let durationTime = $scope.invitation.duration || ($scope.invitation.duration = new Date('1970/1/1 1:0:0'));
                let duration = durationTime.getHours() * 60 * 60 * 1000 + durationTime.getMinutes() * 60 * 1000
                let endTime = new Date($scope.invitation.startTime.getTime() + duration);
                return `${fixNum(endTime.getHours())}:${fixNum(endTime.getMinutes())}`
            }
            $scope.transTimeStamp = (date) => {
                console.log(date, "chuanguolai")
                let data = (new Date(date).getTime()) / 1000
                // return data.toString();
                return data + '';
            }

            let sendEditRequest = () => {
                let invitation = $scope.invitation;
                let theme = invitation.theme;
                let _startTime: Date = invitation.startTime;
                let _duration: Date = invitation.duration;
                let durationValue: string = invitation.durationValue;
                let startTime = remote_res.toServerDateString(_startTime);
                let hh = _duration.getHours();
                let mm = _duration.getMinutes();
                let sss = hh * 60 * 60 * 1000 + mm * 60 * 1000;
                // let _endTime = new Date(_startTime.getTime() + sss);
                let _endTime = new Date(_startTime.getTime() + parseInt(durationValue) * 60 * 1000);
                let endTime = remote_res.toServerDateString(_endTime);

                if (_startTime.getTime() < Date.now()) {
                    native.messageBox({title: '注意', content: '您选择的会议开始时间早于当前时间。'})
                    // return;
                }

                remoteServ.editInvitation({theme, startTime, endTime}, {invitationId: invitationId})
                    .then(res => {
                        // console.log('edit invitation:', res);
                    })

            }
            $scope.startTimeChange = () => {
                sendEditRequest();
            }
            $scope.durationChange = () => {
                sendEditRequest();
            }

            let parseInvitation = (data: IInvitationDetailMessage) => {
                let theme = data.theme;
                let startTime = data.startTime;
                let endTime = data.endTime;

                let minutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
                let hh = Math.floor(minutes / 60);
                let mm = minutes % 60;
                let duration = new Date(`2016/1/1 ${hh}:${mm}:0`)
                let durationValue = minutes + '';
                console.log(durationValue + "chixushijian")
                return {theme, startTime, endTime, duration, data, durationValue}
            };
            remoteServ.invitationDetail({invitationId: invitationId})
                .then(res => {
                    $scope.invitation = parseInvitation(res.data);
                });

            $scope.cancelInvitation = () => {
                remoteServ.cancelInvitation({invitationId: invitationId})
                    .then(res => {
                        routeControl.goBack();
                    });
            }
        }

    ]
});


//路由的配置
invitation.config([
    '$stateProvider',
    function ($stateProvider: router.StateProvider) {
        $stateProvider
            .state(components.create.name, {
                url: '/invitation/create',
                component: components.create.name
            })
            .state(components.detail.name, {
                url: '/invitation/detail',
                component: components.detail.name
            })
            .state(components.setupTheme.name, {
                url: '/invitation/setup-theme',
                component: components.setupTheme.name
            })
            .state(components.setupTheme.name + '_save', {
                url: '/invitation/setup-theme/:invitationId',
                component: components.setupTheme.name
            })
            .state(components.edit.name, {
                url: '/invitation/edit/:invitationId',
                component: components.edit.name
            })
            .state(components.invite.name, {
                url: '/invitation/invite/:invitationId',
                component: components.invite.name
            })
    }
]);