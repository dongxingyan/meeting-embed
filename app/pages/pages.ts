import * as angular from 'angular';
import * as invitation from './invitation/invitation';
import * as myMeetingRoom from './my_meeting_room/my_meeting_room';
import * as recharge from './recharge/recharge';
import * as loading from './loading/loading';

export let name = 'me.pages';
angular.module(name, [invitation.name, myMeetingRoom.name, recharge.name, loading.name]);