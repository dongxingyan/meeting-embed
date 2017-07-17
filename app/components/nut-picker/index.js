"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angualr = require("angular");
exports.name = 'nuts.picker';
require('./picker.styl');
angualr.module(exports.name, [])
    .directive('nutPicker', [
    function () {
        return {
            template: require('./picker.tmpl.html'),
            controller: [function () { }],
            scope: {
                nutData: '<',
                nutIndex: '='
            },
            link: function (scope, elem, attrs) {
                var outerEl = elem[0].getElementsByClassName('nut-picker-container')[0];
                var innerEl = elem[0].getElementsByClassName('nut-picker-scrollview')[0];
                var contentHeight = innerEl.offsetHeight;
                var containerHeight = outerEl.offsetHeight;
                outerEl.addEventListener('touchend', function (x) {
                    // console.log(outerEl.scrollTop);
                });
            }
        };
    }
]);
//# sourceMappingURL=index.js.map