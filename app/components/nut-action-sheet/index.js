"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angular_1 = require("angular");
require('./action-sheet.styl');
var tmpl = require('./action-sheet.tmpl.html');
exports.name = 'nut.actionSheet';
var showActionSheet;
/**
 * ActionSheet的每个按钮
 */
var ActionSheetButton = (function () {
    function ActionSheetButton(title, classNames, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.callback = function () { };
        this.title = title;
        this.classNames = classNames;
        this.callback = callback;
    }
    return ActionSheetButton;
}());
exports.ActionSheetButton = ActionSheetButton;
/**
 * ActionSheet服务（废弃）
 */
var ActionSheetService = (function () {
    function ActionSheetService() {
    }
    /**
     * 显示ActionSheet
     * @param buttons 需要显示的按钮组
     * @param cancelCallback 被取消时的回调函数
     */
    ActionSheetService.prototype.showActionSheet = function (buttons, cancelCallback) {
        if (buttons === void 0) { buttons = []; }
        if (cancelCallback === void 0) { cancelCallback = function () { }; }
        showActionSheet(buttons, cancelCallback);
    };
    return ActionSheetService;
}());
ActionSheetService.Button = ActionSheetButton;
exports.ActionSheetService = ActionSheetService;
/**
 * actionsheet的使用逻辑是，把nut-action-sheet组件放到页面上，然后就可以随时使用actionsheet服务打开。
 */
angular_1.module(exports.name, [])
    .factory('ActionSheet', [
    '$timeout',
    function ($timeout) {
        return {
            show: function (buttons, cancelCallback) {
                // timeout是为了避免一些特殊错误
                $timeout(function () {
                    showActionSheet(buttons, cancelCallback);
                });
            }
        };
    }
])
    .component('nutActionSheet', {
    template: tmpl,
    controller: [
        '$scope',
        function ($scope) {
            $scope.active = false;
            $scope.hide = function () {
                $scope.active = false;
            };
            $scope.cancel = function (callback) {
                callback && callback();
                $scope.cancelCallback && $scope.cancelCallback();
            };
            $scope.show = function () {
                $scope.active = true;
            };
            showActionSheet = function (buttons, cancelCallback) {
                buttons.forEach(function (button) {
                    var classConfig = button.classConfig = {};
                    for (var i in button.classNames) {
                        classConfig[button.classNames[i]] = true;
                    }
                });
                $scope.buttons = buttons;
                $scope.cancelCallback = cancelCallback;
                $scope.show();
                return $scope.cancel;
            };
        }
    ]
});
//# sourceMappingURL=index.js.map