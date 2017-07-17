/**
 * 全局配置
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angular = require("angular");
exports.name = 'me.global';
exports.serv = 'Global';
// export let shareUrl ="https://mymeeting.cloudp.cc"; // 分享会议邀请-> QQ、微信中的链接url
exports.shareUrl = "https://mymeeting-dev.cloudp.cc"; // 分享会议邀请-> QQ、微信中的链接url
// export let shareImgUrl = "https://mymeeting.cloudp.cc/dxt-logo1.png"; // 分享会议邀请 -> QQ、微信中的图片
exports.shareImgUrl = "https://mymeeting-dev.cloudp.cc/dxt-logo1.png"; // 分享会议邀请 -> QQ、微信中的图片
// export let apiPath = 'https://api.cloudp.cc'; // 服务器端webapi的地址
exports.apiPath = 'https://api-dev.cloudp.cc'; // 服务器端webapi的地址
angular
    .module(exports.name, [])
    .constant(exports.serv, {
    version: '1.0.0',
    // domain: '@test.cloudp.cc',
    domain: '',
    shareUrl: exports.shareUrl,
});
//# sourceMappingURL=global.js.map