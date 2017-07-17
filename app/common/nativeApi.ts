/**
 * 与NativeApplication通讯的服务
 */

import * as angular from 'angular'
import * as global from '../global'
import * as angualr from 'angular';

interface Response {
    resultCode: string;
    resultMsg: string;
    version: string;
}

export class CheckJsApiParams {
    apiList: string[];

}
//接口ICheckJsApiResponse需要继承接口Response
export interface ICheckJsApiResponse extends Response {
    /**
     * 支持的api列表
     */
    apiList: string[];
}

export interface IGetVersionResponse extends Response {
    version: string;
}
//enum指DeviceType是枚举类型
export enum DeviceType {
    Android = 1,
    IOS = 2,
    BOX = 3
}
export interface IGetDeviceTypeResponse extends Response {
    deviceType: DeviceType;
}

export interface IGetNetworkTypeResponse extends Response {
    /**
     * 2g,3g,4g,wifi
     */
    deviceType: string;
}


export class NativeApiService {
    constructor(public q: angular.IQService, public _global) {
        window['native'] = this;
    }

    /**
     * 检查方法是否支持
     */
    checkJsAPI(params: CheckJsApiParams) {
        let deferred = this.q.defer<ICheckJsApiResponse>();
        dxtApp.checkJsApi(params, (res: ICheckJsApiResponse) => {
            deferred.resolve(res);
        });
        return deferred.promise;
    }

    showLoading(title?: string, content?: string) {
        dxtApp.showLoading({ title, content });
    }

    hideLoading() {
        dxtApp.hideLoading();
    }

    /**
     * 检查设备类型
     */
    getDeviceType() {
        let deferred = this.q.defer<IGetDeviceTypeResponse>();
        dxtApp.getDeviceType((res) => {
            deferred.resolve(res);
        });
        return deferred.promise;
    }

    /**
     * 检查电信通版本
     */
    getVersion() {
        let deferred = this.q.defer<IGetVersionResponse>();
        dxtApp.getVersion((res) => {
            deferred.resolve(res);
        });
        return deferred.promise;
    }

    /**
     * 检查网络状态
     */
    getNetworkType() {
        let deferred = this.q.defer<IGetNetworkTypeResponse>();
        dxtApp.getVersion((res) => {
            deferred.resolve(res);
        });
        return deferred.promise;
    }

    /**
     * 设置浏览器标题
     */
    setBrowserTitle(req: { title: string, hideTitle?: boolean }) {
        let deferred = this.q.defer<Response>();
        dxtApp.setBrowserTitle(req, (res) => {
            deferred.resolve(res);
        });
        return deferred.promise;
    }

    /**
     * 吐司弹框
     */
    showTip(req: { title: string, content: string }) {
        let deferred = this.q.defer<Response>();
        dxtApp.showTip(req, (res) => {
            deferred.resolve(res);
        });
        return deferred.promise;
    }


    /**
     * 消息框
     */
    messageBox(req: { title: string, content: string }) {
        let deferred = this.q.defer<Response>();
        dxtApp.messageBox(req, (res) => {
            deferred.resolve(res);
        });
        return deferred.promise;
    }


    /**
     * 对话框
     */
    showDialog(req: { title: string, content: string }) {
        let deferred = this.q.defer<Response>();
        dxtApp.showDialog(req, (res) => {
            deferred.resolve(res);
        });
        return deferred.promise;
    }

    sendIM(cloudpId, msgBody, msgType?, msgExtras?) {
        return new Promise(function (resolve, reject) {
            dxtApp.sendIM({
                cloudpIds: cloudpId,
                msgBody: msgBody,
                msgType: msgType || 0,
                msgExtras: msgExtras || ''
            }, (res) => {
                resolve(res);
            })
        })
    }

    /**
     * 电信通分享
     */
    shareDxt(req: {
        title: string,
        desc: string,
        link: string,
        imgUrl: string,
        mTitle?: string,
        mTime?: string,
        mId?: string,
        mPwd?: string,
        mEndTime?:string;
    }) {
        console.debug('电信通分享数据包：', req);
        let deferred = this.q.defer<Response>();
        dxtApp.shareDxt(req, (res) => {
            deferred.resolve(res);
            console.log(res+"返回的响应")
        });
        return deferred.promise;
    }

    /**
     * 微信分享
     */
    shareWechat(req: { title: string, desc: string, link: string, imgUrl: string }) {
        let deferred = this.q.defer<Response>();
        dxtApp.shareWechat(req, (res) => {
            // console.log('share: ', req, res);
            deferred.resolve(res);
        });
        return deferred.promise;
    }

    /**
     * QQ通分享
     */
    shareQQ(req: { title: string, desc: string, link: string, imgUrl: string }) {
        let deferred = this.q.defer<Response>();
        dxtApp.shareQQ(req, (res) => {
            // console.log('share: ', req, res);
            deferred.resolve(res);
        });
        return deferred.promise;
    }


    /**
     * 调用支付页面
     */
    dxtAppPay(req: {
        appid: string,
        openid: string,
        app_trade_no: string,
        good_title: string,
        good_detail: string,
        total_fee: number, //单位：分
        pay_channel: string, //wxpay|alipay|apple
        notify_url: string
    }) {

        return new Promise<{ resultCode: string, resultMsg: string }>((resolve, reject) => {
            dxtApp.dxtAppPay(req, (res) => {
                resolve(res);
            });
        })
    }

    /**
     * 加入会议
     */
    joinConference(req: {
        nickname: string,
        password: string,
        conference_no: string,
        domain: string,
        microphone_status: boolean,
        camera_status: boolean
    }) {
        let deferred = this.q.defer<Response>();
        let _req = angualr.merge(req, { domain: this._global.domain });
        dxtApp.joinConference(_req, (res) => {
            deferred.resolve(res);
            console.log(_req, res+"进入我的会议室");

        });
        return deferred.promise;
    }

}
//引入dxtApp
declare let dxtApp: any;

export let name = 'dxt.api';
export let servName = 'NativeApi';

angular.module(name, [])
    .factory(servName, [
        global.serv, '$q', 'Global',
        function (global, $q: angular.IQService, _global) {
            return new NativeApiService($q, _global);
        }
    ]);