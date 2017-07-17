/**
 * 整理common文件夹下的各个文件
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angular = require("angular");
var remoteRes = require("./remote_resource");
var routeControl = require("./route_control");
var models = require("./models/models");
var native = require("./nativeApi");
var log = require("./log");
exports.name = 'me.common';
angular.module(exports.name, [remoteRes.name, models.name, routeControl.name, native.name, log.name]);
//# sourceMappingURL=common.js.map