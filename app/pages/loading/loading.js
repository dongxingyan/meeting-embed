"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('./loading.styl');
var angular = require("angular");
var remote_res = require("../../common/remote_resource");
var native_api = require("../../common/nativeApi");
var session_model = require("../../common/models/session");
var my_meeting_room_1 = require("../my_meeting_room/my_meeting_room");
var mAlert = alert;
exports.name = 'me.pages.loading';
var template = require('./loading.tmpl.html');
// console.log('$scope', remote_res.serviceName, session_model.serviceName, native_api.servName);
angular.module(exports.name, [])
    .component('loading', {
    template: template,
    controller: [
        'RouteControl', '$scope', '$state', remote_res.serviceName, session_model.serviceName, native_api.servName,
        function (RouteControl, $scope, $state, remote, session, native) {
            remote.login({ openId: session.openid, channel: '电信通' })
                .then(function (res) {
                switch (res.data.status) {
                    case 0:
                        $state.go(my_meeting_room_1.components.create.name);
                        native.hideLoading && native.hideLoading();
                        return null;
                    default:
                        return remote.getMeetingRoomInfo();
                }
            })
                .then(function (res) {
                RouteControl.popThis();
                if (res && res.code === '38') {
                    $state.go(my_meeting_room_1.components.create.name);
                    native.hideLoading && native.hideLoading();
                    return null;
                }
                if (res && res.code === '0') {
                    session.myMeetingRoom = res.data[res.data.length - 1];
                    $state.go(my_meeting_room_1.components.index.name);
                    native.hideLoading && native.hideLoading();
                }
            })
                .catch(function (error) {
                // console.log(error);
                if (error.code && error.msg) {
                    mAlert(error.msg);
                }
            });
        }
    ]
})
    .config([
    '$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state({
            name: 'loading',
            url: '/loading',
            component: 'loading'
        });
    }
]);
//# sourceMappingURL=loading.js.map