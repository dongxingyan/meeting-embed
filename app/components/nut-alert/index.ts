declare let require;
require('./alert.styl');

let tmpl = require('./alert.tmpl.html');
import { module } from 'angular';

export let name = 'nut.alert';
/**
 * 弹出框的使用逻辑：
 * 把alert放到页面上，把想要在弹出框里显示的内容写在nut-alert的标签体里。为nut-alert指定一个modalId
 * 弹框时，使用服务传入modalId弹出指定对话框
 */
module(name, [])
    .component('nutAlert', {
        template: tmpl,
        transclude: true,
        bindings: { show: '=', modalId: '@' },
        controllerAs: 'vm',
        controller: ['$scope', 'NutModal',
            function ($scope, NutModal) {
                this.hide = function () {
                    this.show = false;
                };
                this.stopBubble = function (event: angular.IAngularEvent) {
                    event.stopPropagation();
                };
                NutModal.register(this.modalId, () => {
                    this.show = true;
                    return () => {
                        this.show = false;
                    }
                })
            }]
    })
    .factory('NutModal', function () {
        let saved = {
        };
        return {
            show: function (id) {
                return saved[id]()
            },
            register: function (id, callback) {
                saved[id] = callback;
            }
        }
    });