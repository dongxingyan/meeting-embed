/**
 * 整理common文件夹下的各个文件
 */

import * as angular from 'angular';
import * as remoteRes from './remote_resource';
import * as routeControl from './route_control';
import * as models from './models/models';
import * as native from './nativeApi'
import * as log from './log'
export let name = 'me.common';

angular.module(name, [remoteRes.name, models.name,routeControl.name,native.name,log.name]);