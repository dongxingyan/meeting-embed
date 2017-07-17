import {IGetAccountInfoResponse} from "../../common/models/basic/GetAccountInfo";
declare let require; // 为webpack的require语法所做的特殊声明
require('./loading.styl');

import * as angular from 'angular';
import * as router from 'angular-ui-router';
import * as actionSheet from '../../components/nut-action-sheet'

import * as remote_res from '../../common/remote_resource';
import * as native_api from '../../common/nativeApi';
import * as session_model from '../../common/models/session';
import {ILoginResponse} from "../../common/models/basic/Login";
import {StateService} from "angular-ui-router";
import {components} from '../my_meeting_room/my_meeting_room';
import IHttpResponseTransformer = angular.IHttpResponseTransformer;

let mAlert = alert;

export let name = 'me.pages.loading';
let template = require('./loading.tmpl.html');
// console.log('$scope', remote_res.serviceName, session_model.serviceName, native_api.servName);
angular.module(name, [])
    .component('loading', {
        template: template,
        controller: [
            'RouteControl', '$scope', '$state', remote_res.serviceName, session_model.serviceName, native_api.servName,
            function (RouteControl,
                      $scope,
                      $state: StateService,
                      remote: remote_res.RemoteResourceService,
                      session: session_model.SessionService,
                      native: native_api.NativeApiService) {


                remote.login({openId: session.openid, channel: '电信通'})
                    .then((res) => {
                            switch (res.data.status) {
                            case 0:
                                $state.go(components.create.name);
                                native.hideLoading && native.hideLoading();
                                return null;
                            default:
                                return remote.getMeetingRoomInfo();
                        }
                    })
                    .then(res => {
                        RouteControl.popThis();
                        if (res && res.code === '38') {
                            $state.go(components.create.name);
                            native.hideLoading && native.hideLoading();
                            return null;
                        }
                        if (res && res.code === '0') {
                            session.myMeetingRoom = res.data[res.data.length - 1];
                            $state.go(components.index.name);
                            native.hideLoading && native.hideLoading();
                        }
                    })
                    .catch(error => {
                        // console.log(error);
                        if (error.code && error.msg) {
                            mAlert(error.msg);
                        }
                    })
            }
        ]
    })
    .config([
        '$stateProvider',
        function ($stateProvider: router.StateProvider) {
            $stateProvider
                .state({
                    name: 'loading',
                    url: '/loading',
                    component: 'loading'
                });
        }
    ]);