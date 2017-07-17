"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angular = require("angular");
var global = require("../global");
exports.name = 'me.common.log';
angular.module(exports.name, [])
    .factory('Log', [
    global.serv,
    function (global) {
        var debug = global.debug;
        var logTags = global.logTags;
        return function (tag) { return function () {
            if (logTags.indexOf(tag) >= 0) {
                console.log.apply(console, [tag + ': '].concat(Array.prototype.slice.call(arguments)));
            }
        }; };
    }
]);
//# sourceMappingURL=log.js.map