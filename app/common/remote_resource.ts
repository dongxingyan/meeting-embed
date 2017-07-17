/**
 * 与远端服务器通讯的服务
 */
import * as angular from 'angular'
import { ILoginRequest, ILoginResponse } from "./models/basic/Login";
import { ICreateMeetingRoomRequest, ICreateMeetingRoomResponse } from "./models/basic/CreateMeetingRoom";
import { IEditMeetingRoomResponse } from "./models/basic/EditMeetingRoom";
import { IGetMeetingRoomResponse, IMeetingRoom } from "./models/basic/IGetMeetingRoomInfo";
import { IGetAccountInfoResponse } from "./models/basic/GetAccountInfo";
import { ILaunchInvitationRequest, ILaunchInvitationResponse } from "./models/Business/LaunchInvitation";
import { IInvitationRecordRequest, IInvitationRecordResponse } from "./models/Business/InvitationRecord";
import { IEditInvitationRequest, IEditInvitationResponse } from "./models/Business/EditInvitation";
import { ICancelInvitationRequest, ICancelInvitationResponse } from "./models/Business/CancelInvitation";
import { IInvitationDetailRequest, IInvitationDetailResponse } from "./models/Business/InvitationDetail";
import { IGetChargingPackageRequest, IGetChargingPackageResponse } from "./models/Business/GetChargingPackage";
import { IVmrTimeBillRequest, IVmrTimeBillResponse } from "./models/Business/VmrTimeBill";
import { IUseScheduleRequest, IUseScheduleResponse } from "./models/Business/UseSchedule";
import { IRechargeRequest, IRechargeResponse } from "./models/Business/Recharge";
import { IGenerateOrderRequest, IGenerateOrderResponse } from "./models/Business/GenerateOrder";
import { IQueryOrderRequest, IQueryOrderResponse } from "./models/Business/QueryOrder";
import IPromise = angular.IPromise;
import * as _session from './models/session'
import * as angualr from 'angular';

/**
 * 可以把类似于1、2、3、4、5变换成"01"、"02"、"03"、"04"、"05"。
 * @param number
 */
export let fixNum = (number) => (number < 10 && number >= 0) ? '0' + number : number + '';
/**
 * 把Date对象转换成服务器端的字符串表示法。“2016-10-10 10:10”
 * @param date
 */
export let toServerDateString = (date: Date) => `${fixNum(date.getUTCFullYear())}-${fixNum(date.getUTCMonth() + 1)}-${fixNum(date.getUTCDate())} ${fixNum(date.getUTCHours())}:${fixNum(date.getUTCMinutes())}:${fixNum(date.getUTCSeconds())}`;
/**
 * 把服务器端的字符串转换成对象（废弃）
 * @param dateStr
 * @returns {Date}
 */
export let getDateByString = dateStr => {
    let servsidFormat = /^\d-\d-\d \d:\d:\d$/;
    if (servsidFormat.test(dateStr)) {
        let arr = dateStr.splice(/[- :]/).map(function (dateStr) {
            return parseInt(dateStr);
        });
        return new Date(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]);
    } else {
        return new Date(dateStr);
    }
};
/**
 * 把服务器端的字符串转换成对象
 * @param dateStr
 * @returns {Date}
 */
export let getDateByServerString = (dateStr: string) => {
    // console.log(dateStr);
    if (/^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d$/.test(dateStr)) {
        return new Date(dateStr.replace(/[-]/g, '/') + ' GMT');
    } else {
        return new Date(dateStr);
    }
};

export let getFixedDateStr = (date: Date) => {
    let fixNum = (number) => (number < 10 && number >= 0) ? '0' + number : number + '';
    let datestr = `${fixNum(date.getMonth() + 1)}/${fixNum(date.getDate())}`;//几月几日
    let now = new Date();
    let today = new Date(`${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`);
    let computedTimeleft = date.getTime() - today.getTime();
    if (computedTimeleft > 0 && computedTimeleft < 24 * 3 * 60 * 60 * 1000) {
        datestr = '后天';
        if (computedTimeleft < 24 * 2 * 60 * 60 * 1000) {
            datestr = '明天';
            if (computedTimeleft < 24 * 1 * 60 * 60 * 1000) {
                datestr = '今天';
            }
        }
    } else if (computedTimeleft < 0 && computedTimeleft > -1 * 24 * 60 * 60 * 1000) {
        datestr = '昨天';
    } else {
        datestr = `${fixNum(date.getMonth() + 1)}-${fixNum(date.getDate())}`
    }
    return datestr;
}

/**
 * 服务器资源配置
 */
export class RemoteResourceProvider {
    $get: any;
    _serverPath: string;

    setServerPath(value) {
        this._serverPath = value;
    }
    constructor() {
        this.$get = [
            '$http', '$q', 'SessionService',
            function ($http: angular.IHttpService, $q, session: _session.SessionService) {
                return new RemoteResourceService(this._serverPath, $http, $q, session);
            }
        ];
    }
}

/**
 * 服务器资源对象
 */
export class RemoteResourceService {
    login(data: ILoginRequest): IPromise<ILoginResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/login`;
        return this.http.get(path, { params: data })
            .then((res: any) => {
                // if (res.data.code !== '0') {
                //     return this.q.reject(res.data)
                // }
                return this.q.resolve(res.data);
            })
    }

    saveInvitedList(invitationId, data) {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/saveInvitedList`;
        return this.http.post(path, data, {
            params: { openId: this.session.openid, invitationId: invitationId }
        })
    }

    createMeetingRoom(): IPromise<ICreateMeetingRoomResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/createMeetingRoom`;
        return this.http.post(path, {}, {
            params: { openId: this.session.openid }
        })
            .then((res: any) => {
                return this.q.resolve(res.data);
            })
    }

    editMeetingRoom(data: IMeetingRoom): IPromise<IEditMeetingRoomResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/editMeetingRoom`;
        return this.http.put(path, data, { params: { openId: this.session.openid } })
            .then((res: any) => {
                return this.q.resolve(res.data);
            })
    }

    getMeetingRoomInfo(): IPromise<IGetMeetingRoomResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/getmeetingRoomInfo`;
        return this.http.get(path, {
            params: {
                openId: this.session.openid
            }
        })
            .then((res: any) => {
                // if (res.data.code !== '0') {
                //     return this.q.reject(res.data)
                // }
                return this.q.resolve(res.data);
            })
    }

    getAccountInfo(): IPromise<IGetAccountInfoResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/getAccountInfo`;
        return this.http.get(path, {
            params: { openId: this.session.openid }
        })
            .then((res: any) => {
                // if (res.data.code !== '0') {
                //     return this.q.reject(res.data)
                // }
                return this.q.resolve(res.data);
            })
    }

    launchInvitation(data: ILaunchInvitationRequest): IPromise<ILaunchInvitationResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/launchInvitation`;
        return this.http({
            method: 'POST',
            url: path,
            params: { openId: this.session.openid },
            data: data
        })
            .then((res: any) => {
                if (res.data.code !== '0') {
                    return this.q.reject(res.data)
                }
                return this.q.resolve(res.data);
            })
    }

    invitationRecord(data: IInvitationRecordRequest): IPromise<IInvitationRecordResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/invitationRecord`;
        return this.http.get(path, {
            params: { openId: this.session.openid, start: data.start, size: data.size }
        })
            .then((res: any) => {
                if (res.data.code !== '0') {
                    return this.q.reject(res.data)
                }
                res.data.data.resultList.forEach(record => {
                    record.startTime = getDateByServerString(record.startTime);
                    record.endTime = getDateByServerString(record.endTime);
                });
                return this.q.resolve(res.data);
            })
    }

    editInvitation(data: IEditInvitationRequest, params: { invitationId: string }): IPromise<IEditInvitationResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/editInvitation?openId=${this.session.openid}&invitationId=${params.invitationId}`;
        return this.http.put(path, data, {
            // params: angular.merge({}, params, {openId: this.session.openid})
        })
            .then((res: any) => {
                // if (res.data.code !== '0') {
                //     return this.q.reject(res.data)
                // }
                return this.q.resolve(res.data);
            })
    }

    cancelInvitation(data: ICancelInvitationRequest): IPromise<ICancelInvitationResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/cancelInvitation`;
        return this.http.post(path, {}, {
            params: angular.merge({ openId: this.session.openid }, data)
        })
            .then((res: any) => {
                // if (res.data.code !== '0') {
                //     return this.q.reject(res.data)
                // }
                return this.q.resolve(res.data);
            })
    }

    invitationDetail(data: IInvitationDetailRequest): IPromise<IInvitationDetailResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/invitationDetail`;
        return this.http.get(path, {
            params: angular.merge({ openId: this.session.openid }, data)
        })
            .then((res: any) => {
                let data: any = res.data;
                // 服务器端传回的是北京时间的字符串（2017-3-10 11:11:11）格式的
                data.data.endTime = getDateByServerString(data.data.endTime);
                data.data.startTime = getDateByServerString(data.data.startTime);
                // 服务器端传回的是个字符串……超无奈的
                try {
                    data.data.invitedList = JSON.parse(data.data.invitedList).map(x => ({ cloudpId: x.dxtNum, avatar: x.avatar, nickname: x.nickname }));
                } catch (e) {
                    data.data.invitedList = []
                }
                return this.q.resolve(data);
            })
    }

    getChargingPackage(): IPromise<IGetChargingPackageResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/getChargingPackage`;
        return this.http.get(path, {
            params: { openId: this.session.openid }
        })
            .then((res: any) => {
                if (res.data.code !== '0') {
                    return this.q.reject(res.data)
                }
                return this.q.resolve(res.data);
            })
    }

    vmrTimeBill(data: IVmrTimeBillRequest): IPromise<IVmrTimeBillResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/vmrTimeBill`;
        return this.http.get(path, {
            params: angular.merge({ openId: this.session.openid }, data)
        })
            .then((res: any) => {
                let data: any = res.data;
                // console.log('vmr bill request response:', data);
                data.data.resultList.forEach(x => {
                        x.startTime = getDateByServerString(x.startTime);
                        x.endTime = getDateByServerString(x.endTime);

                });
                return this.q.resolve(data);
            })
    }

    useSchedule(data: IUseScheduleRequest): IPromise<IUseScheduleResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/vmrUseSchedule`;
        return this.http.get(path, {
            params: angular.merge({ openId: this.session.openid }, data)
        })
            .then((res: any) => {
                let data: any = res.data;
                data.data.startTime = getDateByServerString(data.data.startTime);
                data.data.endTime = getDateByServerString(data.data.endTime);
                return this.q.resolve(data);
            })
    }

    recharge(data: IRechargeRequest): IPromise<IRechargeResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/mmr/recharge`;
        return this.http.get(path, {
            params: angular.merge({}, { openId: this.session.openid }, data)
        })
            .then((res: any) => {
                // if (res.data.code !== '0') {
                //     return this.q.reject(res.data)
                // }
                let data: any = res.data;
                data.data.createTime = getDateByServerString(data.data.createTime);
                return this.q.resolve(data);
            })
    }

    generateOrder(data): IPromise<IGenerateOrderResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/pay/generateOrder?openId=`+this.session.openid+"&packageId="+data;
        return this.http.post(path, {
            params: {

            }
        })
            .then((res: any) => {
                if (res.data.code !== '0') {
                    return this.q.reject(res.data)
                }
                return this.q.resolve(res.data);
            })
    }

    queryOrder(data: IQueryOrderRequest): IPromise<IQueryOrderResponse> {
        let path = `${this.serverPath}/cloudpServer/v1/pay/queryOrder`;
        return this.http.get(path, {
            params: angualr.merge({ openId: this.session.openid }, data)
        })
            .then((res: any) => {
                // if (res.data.code !== '0') {
                //     return this.q.reject(res.data)
                // }
                return this.q.resolve(res.data);
            })
    }

    apiPaths: {
        login: string;
        createMeetingRoom: string;
        editMeetingRoom: string;
        getMeetingRoomInfo: string;
        getAccountInfo: string;
        launchInvitation: string;
        invitationRecord: string;
        editInvitation: string;
        cancelInvitation: string;
        invitationDetail: string;
        getChargingPackage: string;
        vmrTimeBill: string;
        useSchedule: string;
        recharge: string;
        generateOrder: string;
        queryOrder: string;
    };

    constructor(public serverPath: string, public http: angular.IHttpService, public q: angular.IQService, public session: _session.SessionService) {
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
}

export const name = 'me.common.remote_resource';
export const serviceName = 'RemoteResource';

angular.module(name, [])
    .provider(serviceName, [
        function () {
            return new RemoteResourceProvider();
        }]);