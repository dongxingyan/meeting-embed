import * as angular from 'angular'
import * as global from '../global'
export let name = 'me.common.log';
angular.module(name, [])
    .factory('Log', [
        global.serv,
        function (global) {
            let debug = global.debug;
            let logTags: string[] = global.logTags;
            return tag => () => {
                if (logTags.indexOf(tag) >= 0) {
                    console.log.apply(console, [tag+': '].concat(Array.prototype.slice.call(arguments)));
                }
            }
        }
    ])

