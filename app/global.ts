/**
 * 全局配置
 */

import * as angular from 'angular'

export let name = 'me.global';
export let serv = 'Global';

// export let shareUrl ="https://mymeeting.cloudp.cc"; // 分享会议邀请-> QQ、微信中的链接url
export let shareUrl ="https://mymeeting-dev.cloudp.cc"; // 分享会议邀请-> QQ、微信中的链接url
// export let shareImgUrl = "https://mymeeting.cloudp.cc/dxt-logo1.png"; // 分享会议邀请 -> QQ、微信中的图片
export let shareImgUrl = "https://mymeeting-dev.cloudp.cc/dxt-logo1.png"; // 分享会议邀请 -> QQ、微信中的图片
// export let apiPath = 'https://api.cloudp.cc'; // 服务器端webapi的地址
export let apiPath = 'https://api-dev.cloudp.cc'; // 服务器端webapi的地址

angular
    .module(name, [])
    .constant(serv, {
        version: '1.0.0',
        // domain: '@test.cloudp.cc',
        domain: '', // 进入我的会议室->在电信通号后面的域
        shareUrl: shareUrl,
    });