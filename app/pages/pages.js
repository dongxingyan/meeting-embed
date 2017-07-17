"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angular = require("angular");
var invitation = require("./invitation/invitation");
var myMeetingRoom = require("./my_meeting_room/my_meeting_room");
var recharge = require("./recharge/recharge");
var loading = require("./loading/loading");
exports.name = 'me.pages';
angular.module(exports.name, [invitation.name, myMeetingRoom.name, recharge.name, loading.name]);
//# sourceMappingURL=pages.js.map