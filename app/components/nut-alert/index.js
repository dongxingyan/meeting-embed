"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('./alert.styl');
var tmpl = require('./alert.tmpl.html');
var angular_1 = require("angular");
exports.name = 'nut.alert';
/**
 * 弹出框的使用逻辑：
 * 把alert放到页面上，把想要在弹出框里显示的内容写在nut-alert的标签体里。为nut-alert指定一个modalId
 * 弹框时，使用服务传入modalId弹出指定对话框
 */
angular_1.module(exports.name, [])
    .component('nutAlert', {
    template: tmpl,
    transclude: true,
    bindings: { show: '=', modalId: '@' },
    controllerAs: 'vm',
    controller: ['$scope', 'NutModal',
        function ($scope, NutModal) {
            var _this = this;
            this.hide = function () {
                this.show = false;
            };
            this.stopBubble = function (event) {
                event.stopPropagation();
            };
            NutModal.register(this.modalId, function () {
                _this.show = true;
                return function () {
                    _this.show = false;
                };
            });
        }]
})
    .factory('NutModal', function () {
    var saved = {};
    return {
        show: function (id) {
            return saved[id]();
        },
        register: function (id, callback) {
            saved[id] = callback;
        }
    };
});
//# sourceMappingURL=index.js.map