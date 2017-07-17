import * as angular from 'angular';
import * as remoteResource from '../remote_resource';
import { IMeetingRoom } from "./basic/IGetMeetingRoomInfo";

export let name = 'me.common.models.session';
export let serviceName = 'SessionService';

export enum DeviceType {
    ANDROID,
    IOS,
    HTML5,
    OTHERS
}
export class SessionService {
    isBindMobile = false;
    private _openid: string;
    private _nickName: string;
    private _remainTime: number = -1;  // 会议室剩余可用时间
    private _myMeetingRoom: IMeetingRoom = { // 会议室的信息
        name: '会议室信息加载中',
        hostPassword: '123456',
        guestPassword: '654321',
        meetingRoomNum: "700025",
    };
    private _deviceType: DeviceType; // 原生app传来的：手机的类型
    private _language: string; //  原生app传来的：语言

    private _inputPageInvitationTheme = this._myMeetingRoom.name; // 输入框：会议邀请/修改或创建 -> 主题输入框

    private _editInvitationCached: any = {};

    get editInvitationCached() {
        return this._editInvitationCached;
    }

    set editInvitationCached(value) {
        this._editInvitationCached = value;
    }

    get inputPageInvitationTheme() {
        return this._inputPageInvitationTheme;
    }

    set inputPageInvitationTheme(value) {
        this._inputPageInvitationTheme = value;
    }

    get remainTime() {
        return this._remainTime;
    }

    set remainTime(value) {
        this._remainTime = value;
    }

    get nickName() {
        return this._nickName;
    }

    set nickName(value) {
        this._nickName = value
    }

    get openid() {
        return this._openid;
    }

    set openid(value) {
        this._openid = value;
    }

    get myMeetingRoom() {
        return this._myMeetingRoom;
    }

    set myMeetingRoom(value) {
        this._myMeetingRoom = value;
    }

    get deviceType() {
        return this._deviceType;
    }

    set deviceType(value) {
        this._deviceType = value;
    }

    get language() {
        return this._language;
    }

    set language(value) {
        this._language = value;
    }


    constructor(// 被依赖注入的项目，按照顺序书写在这里
        // public remote: remoteResource.RemoteResourceService
    ) {
        window['session'] = this;
        let params: any = location.search.split(/[\?&]/).filter(x => x).reduce((pv, x: any) => {
            let pair = x.split('=');
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
}

// 依赖的服务名按顺序书写在这里
let dependencies: (string | Function)[] = [
    // remoteResource.serviceName,
];

angular
    .module(name, [])
    .service(serviceName, dependencies.concat([SessionService]));