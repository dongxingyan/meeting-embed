import * as angular from 'angular';
import * as session from './session';

export let name = 'me.common.models';
angular.module(name, [session.name]);