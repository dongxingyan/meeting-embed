"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('./page.styl');
var tmpl = require('./page.tmpl.html');
var angular_1 = require("angular");
var m_native = require("../../common/nativeApi");
exports.name = 'nut.page';
angular_1.module(exports.name, [])
    .component('nutPage', {
    template: tmpl,
    transclude: true,
    bindings: { title: '@', icon: '@', extCallback: "&", hideTitle: '<' },
    controllerAs: 'vm',
    controller: ['$scope', '$state', 'RouteControl', m_native.servName,
        function ($scope, $state, RouteControl, native) {
            var _this = this;
            var styleConfig = this.styleConfig = {};
            this.hasBackBtn = function () { return RouteControl.stateStack.length > 1; };
            setTimeout(function () {
                try {
                    console.debug("\u5C1D\u8BD5\u8BBE\u7F6E\u6807\u9898\uFF1Anative.setBrowserTitle({ title: " + _this.title + " ,hideTitle:" + !!_this.hideTitle + "});", _this);
                    native.setBrowserTitle({ title: _this.title, hideTitle: !!_this.hideTitle });
                }
                catch (err) {
                    console.debug('尝试设置标题时出错', err);
                }
            });
            /**
             * 按钮的样式设置
             */
            styleConfig[this.icon] = true;
            this.goBack = function () {
                RouteControl.goBack();
            };
        }]
});
//# sourceMappingURL=index.js.map