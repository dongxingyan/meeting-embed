import { module } from 'angular';

declare let require;
require('./action-sheet.styl');
let tmpl = require('./action-sheet.tmpl.html');

export let name = 'nut.actionSheet'
let showActionSheet: Function;
/**
 * ActionSheet的每个按钮
 */
export class ActionSheetButton {
    title: string;
    classNames: string[];
    classConfig?: any;
    callback = () => { };
    constructor(title: string, classNames: string[], callback: () => void = () => { }) {
        this.title = title;
        this.classNames = classNames;
        this.callback = callback;
    }
}
/**
 * ActionSheet服务（废弃）
 */
export class ActionSheetService {
    static Button = ActionSheetButton;
    /**
     * 显示ActionSheet
     * @param buttons 需要显示的按钮组
     * @param cancelCallback 被取消时的回调函数
     */
    showActionSheet(
        buttons: ActionSheetButton[] = [],
        cancelCallback: Function = () => { }) {
        showActionSheet(buttons, cancelCallback)
    }
}
/**
 * actionsheet的使用逻辑是，把nut-action-sheet组件放到页面上，然后就可以随时使用actionsheet服务打开。
 */
module(name, [])
    .factory('ActionSheet', [
        '$timeout',
        function ($timeout) {
            return {
                show: function (buttons, cancelCallback) {
                    // timeout是为了避免一些特殊错误
                    $timeout(function () {
                        showActionSheet(buttons, cancelCallback);
                    })
                }
            }
        }])
    .component('nutActionSheet', {
        template: tmpl,
        controller: [
            '$scope',
            function ($scope) {
                $scope.active = false;

                $scope.hide = () => {
                    $scope.active = false;
                }
                $scope.cancel = (callback) => {
                    callback && callback();
                    $scope.cancelCallback && $scope.cancelCallback();
                }
                $scope.show = () => {
                    $scope.active = true;
                }
                showActionSheet = (buttons: ActionSheetButton[], cancelCallback) => {
                    buttons.forEach(button => {
                        let classConfig = button.classConfig = {};
                        for (let i in button.classNames) {
                            classConfig[button.classNames[i]] = true;
                        }
                    });
                    $scope.buttons = buttons;
                    $scope.cancelCallback = cancelCallback;
                    $scope.show();
                    return $scope.cancel;
                }
            }
        ]
    })