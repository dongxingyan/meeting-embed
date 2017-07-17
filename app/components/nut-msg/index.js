"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angular_1 = require("angular");
require('./msg.styl');
var tmpl = require('./msg.tmpl.html');
exports.name = 'nut.msg';
angular_1.module(exports.name, [])
    .component('nutMsg', {
    template: tmpl,
    transclude: true,
    bindings: { show: '=', modalId: '@' },
    controllerAs: 'vm',
    controller: ['$scope', 'NutModal', '$timeout',
        function ($scope, NutModal, $timeout) {
            var _this = this;
            NutModal.register(this.modalId, function () {
                _this.show = true;
                $timeout(function () {
                    this.show = false;
                }, 2000);
                return function () {
                    _this.show = false;
                };
            });
        }]
});
//# sourceMappingURL=index.js.map